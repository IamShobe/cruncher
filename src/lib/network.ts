import z from "zod/v4";
import {
  StreamAsyncHandler,
  StreamBridge,
  StreamBridgeSyncRequest,
  StreamSyncHandler,
} from "./streamMessages";

export interface StreamMessageConsumer {
  shouldMatch(message: unknown): unknown | null;
  callback(message: unknown, parsedMessage: unknown): void;
}

export type SubscribeOptions<T extends z.ZodTypeAny> = {
  predicate?: (message: z.infer<T>) => boolean;
  callback: (message: z.infer<T>) => void;
};

export type UnsubscribeFunction = () => void;
export interface StreamConnection {
  initialize(): void;
  invoke<T extends StreamBridgeSyncRequest["kind"]>(
    kind: T,
    params: Parameters<StreamSyncHandler<T>>[0],
    options?: { timeout?: number },
  ): Promise<Awaited<ReturnType<StreamSyncHandler<T>>>>;
  dispatch<T extends StreamBridge["kind"]>(
    kind: T,
    params: Parameters<StreamAsyncHandler<T>>[0],
  ): Promise<void>;
  sendMessage<T extends z.ZodTypeAny>(message: z.infer<T>): void;
  subscribe<T extends z.ZodTypeAny>(
    schema: T,
    options: SubscribeOptions<T>,
  ): UnsubscribeFunction;
  once(consumer: StreamMessageConsumer): void;
  close(): void;
  onReady(callback: () => void): UnsubscribeFunction;
  onClose(callback: () => void): UnsubscribeFunction;
}
