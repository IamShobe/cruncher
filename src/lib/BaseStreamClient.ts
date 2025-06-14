import { StreamConnection, StreamMessageConsumer, SubscribeOptions, UnsubscribeFunction } from "./network";
import { StreamAsyncHandler, StreamBridge, StreamBridgeSyncRequest, StreamSyncHandler } from "./streamMessages";

import { pack, unpack } from 'msgpackr';
import { v4 as uuidv4 } from 'uuid';
import { TypeOf, ZodTypeAny } from "zod";
import { GenericMessageSchema, SyncRequestIn, SyncResponsesSchema } from "./networkTypes";
import { measureTime } from "./utils";


export abstract class BaseStreamClient implements StreamConnection {
    private consumers: StreamMessageConsumer[] = []; // Array to hold consumers

    abstract initialize(): void;
    sendMessage<T extends ZodTypeAny>(message: TypeOf<T>): Promise<void> {
        const serializedMessageBuffer = pack(message);
        return this._sendMessage(serializedMessageBuffer);
    }

    protected abstract _sendMessage(buffer: Buffer<ArrayBufferLike>): Promise<void>;

    subscribe<T extends ZodTypeAny>(schema: T, options: SubscribeOptions<T>): UnsubscribeFunction {
        const consumer: StreamMessageConsumer = {
            shouldMatch: (message: unknown) => {
                const payload = schema.safeParse(message)
                if (!payload.success) {
                    return null;
                }

                const predicate = options.predicate ?? (() => true);

                const matches = predicate(payload.data);
                if (!matches) {
                    return null;
                }

                return payload.data;
            },
            callback: (_message: unknown, parsedMessage: unknown) => {
                options.callback(parsedMessage);
            },
        };
        this.addConsumer(consumer);

        return () => {
            this.removeConsumer(consumer);
        };
    }
    once(consumer: StreamMessageConsumer): void {
        const originalCallback = consumer.callback;
        consumer.callback = (message: unknown, parsedRawMessage: unknown) => {
            try {
                originalCallback(message, parsedRawMessage);
            }
            finally {
                // Remove the consumer after the first match
                this.removeConsumer(consumer);
            }
        }

        this.addConsumer(consumer);
    }
    close(): void {
        this.consumers.length = 0; // Clear all consumers
    }
    abstract onReady(callback: () => void): UnsubscribeFunction;
    abstract onClose(callback: () => void): UnsubscribeFunction;
    protected addConsumer = (consumer: StreamMessageConsumer) => {
        // Add a new consumer to the list
        this.consumers.push(consumer);
    };

    protected removeConsumer = (consumer: StreamMessageConsumer) => {
        // Remove a consumer from the list
        const index = this.consumers.indexOf(consumer);
        if (index !== -1) {
            this.consumers.splice(index, 1);
        }
    }

    protected onMessage = (message: Buffer) => {
        try {
            const parsedRawMessage = measureTime("WebSocket message parsing", () => {
                return unpack(message)
            });
            if (!parsedRawMessage) {
                console.warn('Received empty or invalid message:', message);
                return;
            }

            // Check if the message is GenericMessageSchema compliant
            GenericMessageSchema.parse(parsedRawMessage);

            measureTime("WebSocket message processing", () => {
                // Notify all consumers about the received message
                this.consumers.forEach(consumer => {
                    try {
                        const parsedMessage = consumer.shouldMatch(parsedRawMessage)
                        if (parsedMessage) {
                            consumer.callback(parsedRawMessage, parsedMessage);
                        }
                    } catch (error) {
                        console.error('Error in consumer callback:', error);
                    }
                });
            })
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    }

    dispatch<T extends StreamBridge["kind"]>(kind: T, params: Parameters<StreamAsyncHandler<T>>[0]): Promise<void> {
        return this.sendMessage({
            type: kind,
            payload: params,
        })
    }

    invoke<T extends StreamBridgeSyncRequest['kind']>(kind: T, payload: Parameters<StreamSyncHandler<T>>[0]): Promise<Awaited<ReturnType<StreamSyncHandler<T>>>> {
        if (typeof kind !== 'string' || !kind.trim()) {
            throw new Error("Kind must be a non-empty string");
        }

        const requestId = uuidv4();
        const toWebServerPayload: SyncRequestIn = {
            type: "sync_request",
            kind,
            uuid: requestId,
            payload,
        };

        this.sendMessage(toWebServerPayload);

        // register a promise to wait for the response
        // remove the event listener after the response is received
        // to avoid memory leaks
        return new Promise<Awaited<ReturnType<StreamSyncHandler<T>>>>((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Timeout waiting for response for request ${kind} with ID ${requestId}`));
            }, 10000); // 10 seconds timeout

            const handleResponse = (message: unknown) => {
                try {
                    const response = SyncResponsesSchema.parse(message);
                    if (response.type === "sync_response") {
                        resolve(response.payload);
                    } else if (response.type === "sync_error") {
                        reject(new Error(response.payload.error));
                    }
                } catch (error) {
                    console.error('Error parsing response:', error);
                    reject(new Error('Invalid response format'));
                } finally {
                    clearTimeout(timeout); // Clear the timeout once we have a response
                }
            };

            const callback = (event: unknown) => handleResponse(event);
            this.once({
                shouldMatch: (message: unknown) => {
                    const parsed = SyncResponsesSchema.safeParse(message)
                    if (!parsed.success) {
                        return null;
                    }

                    return parsed.data.uuid === requestId
                },
                callback,
            })
        });
    }
}