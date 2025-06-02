import z from 'zod';

export const QueryBatchDoneSchema = z.object({
    type: z.literal("query_batch_done"),
    payload: z.object({
        jobId: z.string(),
        data: z.array(z.any()), // Adjust the type as needed for your data structure
    }),
});
export type QueryBatchDone = z.infer<typeof QueryBatchDoneSchema>;

export const QueryJobUpdatedSchema = z.object({
    type: z.literal("query_job_updated"),
    payload: z.object({
        jobId: z.string(),
        status: z.enum(["running", "completed", "failed", "canceled"]),
    }),
});
export type QueryJobUpdated = z.infer<typeof QueryJobUpdatedSchema>;


export const ReceivedMessageSchema = z.discriminatedUnion("type", [
    QueryBatchDoneSchema,
    QueryJobUpdatedSchema,
]);
export type ReceivedMessage = z.infer<typeof ReceivedMessageSchema>;


export const UrlNavigationSchema = z.object({
    type: z.literal("url_navigation"),
    payload: z.object({
        url: z.string(),
    }),
});
export type UrlNavigation = z.infer<typeof UrlNavigationSchema>;
