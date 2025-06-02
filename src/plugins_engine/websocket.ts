import { ControllerIndexParam, Search } from "~lib/qql/grammar";
import { measureTime } from "~lib/utils";
import { getAsyncRequestHandler, getSyncRequestHandler } from "~lib/websocket/server";
import { ResponseHandler } from "~lib/websocket/types";
import { MessageSender } from "./controller";
import { QueryBatchDone, QueryJobUpdated, UrlNavigation } from "./protocol_out";
import { SerializeableParams } from "./types";

export const getRoutes = async (messageSender: MessageSender) => {
    const { controller } = await import("./controller")
    return [
        getSyncRequestHandler("getSupportedPlugins", async () => {
            return controller.getSupportedPlugins();
        }),
        getSyncRequestHandler("initializePlugin", async (params: { pluginRef: string, name: string, params: Record<string, unknown> }) => {
            return controller.initializePlugin(params.pluginRef, params.name, params.params);
        }),
        getSyncRequestHandler("getInitializedPlugins", async () => {
            return controller.getInitializedPlugins();
        }),
        getSyncRequestHandler("getControllerParams", async (params: { instanceId: string }) => {
            return controller.getControllerParams(params.instanceId);
        }),
        getSyncRequestHandler("runQuery", async (params: { instanceId: string, controllerParams: ControllerIndexParam[], searchTerm: Search, queryOptions: SerializeableParams }) => {
            return controller.runQuery(messageSender, params.instanceId, params.controllerParams, params.searchTerm, params.queryOptions);
        }),
        getSyncRequestHandler("cancelQuery", async (params: { taskId: string }) => {
            controller.cancelQuery(messageSender, params.taskId);
            return { success: true };
        }),
        getAsyncRequestHandler("hey", async (params: { name: string }) => {
            console.log(`Hello, ${params.name}!`);
        }),
    ] as const;
}

export const getMessageSender = (responder: ResponseHandler): MessageSender => {
    return {
        batchDone: (jobId: string, data: unknown[]) => {
            // chunk data items per message
            const message: QueryBatchDone = {
                type: "query_batch_done",
                payload: {
                    jobId: jobId,
                    data: data,
                },
            }
            measureTime("WebSocket Batch send", () => {
                responder.sendMessage(message);
            })
        },
        jobUpdated: (job) => {
            const message: QueryJobUpdated = {
                type: "query_job_updated",
                payload: {
                    jobId: job.id,
                    status: job.status,
                },
            }
            responder.sendMessage(message);
        },
        urlNavigate: (url: string) => {
            const message: UrlNavigation = {
                type: "url_navigation",
                payload: {
                    url: url,
                },
            };
            responder.sendMessage(message);
        }
    }
}