import { ControllerIndexParam, Search } from "~lib/qql/grammar";
import { measureTime } from "~lib/utils";
import { getAsyncRequestHandler, getSyncRequestHandler } from "~lib/websocket/server";
import { ResponseHandler } from "~lib/networkTypes";
import { appGeneralSettings, MessageSender, setupPluginsFromConfig } from "./controller";
import { QueryBatchDone, QueryJobUpdated, UrlNavigation } from "./protocolOut";
import { QueryTask, SerializeableParams } from "./types";
import { Engine, InstanceRef, SearchProfileRef, TaskRef } from "src/engineV2/engine";
import * as grafana from '../adapters/grafana_browser';
import * as local from '../adapters/mocked_data';

export const getRoutes = async (messageSender: MessageSender, messageSender2: ResponseHandler) => {
    const { controller } = await import("./controller")
    const engineV2 = new Engine(messageSender2);

    engineV2.registerPlugin(grafana.adapter);
    engineV2.registerPlugin(local.adapter);

    // Initialize the plugins

    return [
        getSyncRequestHandler("getSupportedPlugins", async () => {
            return engineV2.getSupportedPlugins();
        }),
        // getSyncRequestHandler("initializePlugin", async (params: { pluginRef: string, name: string, params: Record<string, unknown> }) => {
        //     return controller.initializePlugin(params.pluginRef, params.name, params.params);
        // }),
        getSyncRequestHandler("getInitializedPlugins", async () => {
            return engineV2.getInitializedPlugins();
        }),
        getSyncRequestHandler("runQueryV2", async (params: { instanceRef: InstanceRef, searchTerm: string, queryOptions: SerializeableParams }) => {
            return await engineV2.runQuery(params.instanceRef, params.searchTerm, params.queryOptions);
        }),
        getSyncRequestHandler("getControllerParams", async (params: { instanceRef: InstanceRef }) => {
            // return controller.getControllerParams(params.instanceId);
            return await engineV2.getControllerParams(params.instanceRef);
        }),
        getSyncRequestHandler("runQuery", async (params: { instanceId: string, controllerParams: ControllerIndexParam[], searchTerm: Search, queryOptions: SerializeableParams }) => {
            return controller.runQuery(messageSender, params.instanceId, params.controllerParams, params.searchTerm, params.queryOptions);
        }),
        getSyncRequestHandler("cancelQuery", async (params: { taskId: TaskRef }) => {
            engineV2.cancelQuery(params.taskId);
            return { success: true };
        }),
        getSyncRequestHandler("getLogs", async (params: { jobId: TaskRef }) => {
            return engineV2.getLogs(params.jobId);
        }),
        getSyncRequestHandler("getClosestDateEvent", async (params: { jobId: TaskRef, refDate: number }) => {
            return engineV2.getClosestDateEvent(params.jobId, params.refDate);
        }),

        getSyncRequestHandler("releaseTaskResources", async (params: { jobId: TaskRef }) => {
            engineV2.releaseTaskResources(params.jobId);
            return { success: true };
        }),

        getSyncRequestHandler("resetQueries", async () => {
            engineV2.resetQueries();
            return { success: true };
        }),
    
        getAsyncRequestHandler("ping", async (params: { name: string }) => {
            console.log(`Hello, ${params.name}!`);
        }),
        getSyncRequestHandler("reloadConfig", async () => {
            setupPluginsFromConfig(appGeneralSettings, engineV2);
            return { success: true };
        }),
        getSyncRequestHandler("getGeneralSettings", async () => {
            return controller.getAppGeneralSettings();
        }),
    ] as const;
}

export const newBatchDoneMessage = (jobId: string, data: unknown): QueryBatchDone => {
    return {
        type: "query_batch_done",
        payload: {
            jobId: jobId,
            data: data,
        },
    };
}

export const newJobUpdatedMessage = (jobId: string, status: QueryTask["status"]): QueryJobUpdated => {
    return {
        type: "query_job_updated",
        payload: {
            jobId: jobId,
            status: status,
        },
    };
}

export const newUrlNavigationMessage = (url: string): UrlNavigation => {
    return {
        type: "url_navigation",
        payload: {
            url: url,
        },
    };
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