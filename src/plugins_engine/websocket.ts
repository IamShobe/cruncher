import { Engine, InstanceRef, QueryTask, SerializeableParams, TaskRef } from "src/engineV2/engine";
import { ResponseHandler } from "~lib/networkTypes";
import { getAsyncRequestHandler, getSyncRequestHandler } from "~lib/websocket/server";
import * as grafana from '../adapters/grafana_browser';
import * as local from '../adapters/mocked_data';
import { appGeneralSettings, setupPluginsFromConfig } from "./controller";
import { QueryBatchDone, QueryJobUpdated, UrlNavigation } from "./protocolOut";

export const getRoutes = async (messageSender: ResponseHandler) => {
    const engineV2 = new Engine(messageSender);

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
            return appGeneralSettings;
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
