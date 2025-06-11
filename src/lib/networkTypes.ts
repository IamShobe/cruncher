import z from "zod";

export type WebsocketMessageCustomer = {
    shouldMatch: (message: unknown) => unknown | null;
    callback: (message: unknown, parsedMessage: unknown) => void;
}

export const GenericMessageSchema = z.object({
    type: z.string(),
    payload: z.any(),
});

export const SyncRequestInSchema = z.object({
    type: z.literal("sync_request"),
    kind: z.string(), // The kind of sync request
    uuid: z.string(),
    payload: z.any(), // Adjust the type as needed for your data structure
});

export type SyncRequestIn = z.infer<typeof SyncRequestInSchema>;

export const SyncResponseOutSchema = z.object({
    type: z.literal("sync_response"),
    uuid: z.string(),
    payload: z.any(), // Adjust the type as needed for your data structure
});
export type SyncResponseOut = z.infer<typeof SyncResponseOutSchema>;

export const SyncErrorOutSchema = z.object({
    type: z.literal("sync_error"),
    uuid: z.string(),
    payload: z.object({
        error: z.string(),
        details: z.any().optional(), // Optional details about the error
    }),
});
export type SyncErrorOut = z.infer<typeof SyncErrorOutSchema>;


export const SyncResponsesSchema = z.discriminatedUnion("type", [SyncResponseOutSchema, SyncErrorOutSchema]);


export type ResponseHandler = {
    waitUntilReady: () => Promise<void>;
    sendMessage: (message: unknown) => Promise<void>;
}

export type SyncRequestHandler<T extends string> = {
    kind: T;
    callback: (socket: ResponseHandler, message: SyncRequestIn) => void;
}