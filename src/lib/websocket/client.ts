import { v4 as uuidv4 } from 'uuid';
import SuperJSON from 'superjson';
import { GenericMessageSchema, SyncRequestIn, SyncResponsesSchema, WebsocketMessageCustomer } from "./types";
import { measureTime } from '~lib/utils';
import z from 'zod';


export interface WebsocketClientWrapper {
    once: (consumer: WebsocketMessageCustomer) => void;
    sendMessage: (message: any) => void;
}

export const invokeAsyncRequest = (consumer: WebsocketClientWrapper, kind: string, payload?: any) => {
    const message = {
        type: kind,
        payload: payload,
    }
    consumer.sendMessage(message);
}


export const invokeSyncRequest = (consumer: WebsocketClientWrapper, kind: string, payload?: any) => {
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

    consumer.sendMessage(toWebServerPayload);

    // register a promise to wait for the response
    // remove the event listener after the response is received
    // to avoid memory leaks
    return new Promise<any>((resolve, reject) => {
        const handleResponse = (message: any) => {
            const response = SyncResponsesSchema.parse(message);
            if (response.type === "sync_response") {
                resolve(response.payload);
            } else if (response.type === "sync_error") {
                reject(new Error(response.payload.error));
            }
        };
        const callback = (event: MessageEvent) => handleResponse(event);
        consumer.once({
            shouldMatch: (message: any) => SyncResponsesSchema.safeParse(message).success && message.uuid === requestId,
            callback,
        })
    });
}


export type SubscribeOptions<T extends z.ZodTypeAny> = {
    predicate?: (message: z.infer<T>) => boolean;
    callback: (message: z.infer<T>) => void;
}

export const getWebsocketConnection = (url: string) => {
    const ws = new WebSocket(url);

    const consumers: WebsocketMessageCustomer[] = []; // Array to hold consumers

    ws.addEventListener('message', (event) => {
        try {
            const parsedRawMessage = measureTime("WebSocket message parsing", () => {
                return SuperJSON.parse(event.data);
            });
            if (!parsedRawMessage) {
                console.warn('Received empty or invalid message:', event.data);
                return;
            }

            // Check if the message is GenericMessageSchema compliant
            GenericMessageSchema.parse(parsedRawMessage);

            measureTime("WebSocket message processing", () => {
                // Notify all consumers about the received message
                consumers.forEach(consumer => {
                    if (consumer.shouldMatch(parsedRawMessage)) {
                        consumer.callback(parsedRawMessage);
                    }
                });
            })
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    const addConsumer = (consumer: WebsocketMessageCustomer) => {
        // Add a new consumer to the list
        consumers.push(consumer);
    };

    const removeConsumer = (consumer: WebsocketMessageCustomer) => {
        // Remove a consumer from the list
        const index = consumers.indexOf(consumer);
        if (index !== -1) {
            consumers.splice(index, 1);
        }
    }

    const subscribe = (shouldMatch: (message: any) => boolean, callback: (message: any) => void) => {
        const consumer: WebsocketMessageCustomer = {
            shouldMatch: shouldMatch,
            callback: callback,
        };
        addConsumer(consumer);

        return () => {
            removeConsumer(consumer);
        };
    }

    const subscribeMessage = <T extends z.ZodTypeAny>(schema: T, options: SubscribeOptions<T>) => {
        const cache = new Map<string, any>();
        const consumer: WebsocketMessageCustomer = {
            shouldMatch: (message: any) => {
                const payload = schema.safeParse(message)
                if (!payload.success) {
                    return false;
                }

                const predicate = options.predicate ?? (() => true);

                const matches = predicate(payload.data);
                if (!matches) {
                    return false;
                }

                cache.set("payload", payload.data);
                return true;
            },
            callback: () => {
                const parsedMessage = cache.get("payload") as z.infer<T>;
                options.callback(parsedMessage);
            },
        };
        addConsumer(consumer);

        return () => {
            removeConsumer(consumer);
        };
    }

    return {
        sendMessage: (message: any) => {
            const serializedMessage = SuperJSON.stringify(message);
            ws.send(serializedMessage);
        },
        subscribe: subscribeMessage,
        once: (consumer: WebsocketMessageCustomer) => {
            const originalCallback = consumer.callback;
            consumer.callback = (message: any) => {
                try {
                    originalCallback(message);
                }
                finally {
                    // Remove the consumer after the first match
                    removeConsumer(consumer);
                }
            }

            addConsumer(consumer);
        },
        onReady: (callback: () => void) => {
            ws.addEventListener('open', callback);
        },
        onClose: (callback: () => void) => {
            ws.addEventListener('close', callback);
        },
    };
}