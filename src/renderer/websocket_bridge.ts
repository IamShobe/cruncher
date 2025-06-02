import { QueryBatchDoneSchema, QueryJobUpdatedSchema, UrlNavigationSchema } from "src/plugins_engine/protocol_out";
import { PluginInstance } from "src/plugins_engine/types";
import { QueryProvider } from "~core/common/interface";
import { notifyError } from "~core/notifyError";
import { runQuery } from "~core/search";
import { endFullDateAtom, startFullDateAtom } from "~core/store/dateState";
import { searchQueryAtom } from "~core/store/queryState";
import { store } from "~core/store/store";
import { parseDate } from "~lib/dateUtils";
import { createSignal } from "~lib/utils";
import { getWebsocketConnection, invokeAsyncRequest as originalAsyncInvoke, invokeSyncRequest as originalSyncInvoke } from "~lib/websocket/client";
import type { AsyncInvokeWebSocketHandler, InvokeWebSocketHandler } from "./websocket_messages";

const invokeSyncRequestTyped: InvokeWebSocketHandler = (ws, method, params) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return originalSyncInvoke(ws, method, params) as any;
};

const invokeAsyncRequestTyped: AsyncInvokeWebSocketHandler = (ws, message, params) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return originalAsyncInvoke(ws, message, params) as any;
};

// @ts-expect-error - Expose the WebSocket connection globally for debugging
window.invokeSyncRequestTyped = (method, params) => invokeSyncRequestTyped(ws, method, params); // Expose the WebSocket connection globally for debugging
// @ts-expect-error - Expose the WebSocket connection globally for debugging
window.invokeAsyncRequestTyped = (message, params) => invokeAsyncRequestTyped(ws, message, params); // Expose the WebSocket connection globally for debugging

let ws: ReturnType<typeof getWebsocketConnection> | undefined = undefined;
let selectedPlugin: PluginInstance | undefined = undefined;

const websocketReadySignal = createSignal();

const setup = async () => {
    ws = getWebsocketConnection(`ws://localhost:${await window.electronAPI.getPort()}`);

    ws.onReady(async () => {
        try {
            console.log("WebSocket connection established");

            const response = await invokeSyncRequestTyped(ws, "getSupportedPlugins", {})
            console.log("Supported plugins:", response);

            const initializedPlugins = await invokeSyncRequestTyped(ws, "getInitializedPlugins", {});
            if (initializedPlugins.length === 0) {
                console.warn("No plugins initialized, initializing default plugin...");
                notifyError("No plugins initialized", new Error("No plugins initialized, please add ~/.config/cruncher/cruncher.config.yaml file"));
                return;
            }

            selectedPlugin = initializedPlugins[0];
        } finally {
            websocketReadySignal.signal();
        }
    })

    const unsub = ws.subscribe(UrlNavigationSchema,
        {
            callback: (urlNavigationMessage) => {
                console.log("URL Navigation message received:", urlNavigationMessage);

                const parsedUrl = new URL(urlNavigationMessage.payload.url);

                const startFullDate = parsedUrl.searchParams.get("startTime");
                const endFullDate = parsedUrl.searchParams.get("endTime");
                const searchQuery = parsedUrl.searchParams.get("searchQuery");
                const initialStartTime = parseDate(startFullDate);
                const initialEndTime = parseDate(endFullDate);
                const initialQuery = searchQuery || "";
                console.log("Parsed URL parameters:", {
                    startFullDate: initialStartTime,
                    endFullDate: initialEndTime,
                    searchQuery: initialQuery,
                });

                if (initialStartTime) {
                    store.set(startFullDateAtom, initialStartTime);
                }
                if (initialEndTime) {
                    store.set(endFullDateAtom, initialEndTime);
                }
                store.set(searchQueryAtom, initialQuery);

                runQuery(
                    {
                        searchTerm: store.get(searchQueryAtom),
                        fromTime: store.get(startFullDateAtom),
                        toTime: store.get(endFullDateAtom),
                    },
                    true
                );
            }
        })

    ws.onClose(() => {
        console.warn("WebSocket connection closed. Reconnecting...");
        ws = undefined;
        selectedPlugin = undefined;
        websocketReadySignal.reset();
        unsub(); // Unsubscribe from the previous subscription
        setup(); // Reinitialize the WebSocket connection
    })
}
setup()

export const WEBSOCKET_BRIDGE: QueryProvider = {
    waitForReady: async () => {
        return await websocketReadySignal.wait();
    },
    getControllerParams: async () => {
        await websocketReadySignal.wait({
            timeout: 5000, // Wait for up to 5 seconds for the WebSocket to be ready
        });
        if (!selectedPlugin) {
            throw new Error("No plugin selected. Please ensure that at least one plugin is initialized.");
        }

        return await invokeSyncRequestTyped(ws, "getControllerParams", { instanceId: selectedPlugin.id });
    },
    query: async (params, searchTerm, queryOptions) => {
        await websocketReadySignal.wait({
            timeout: 5000, // Wait for up to 5 seconds for the WebSocket to be ready
        });
        if (!ws) {
            throw new Error("WebSocket connection is not established. Please wait for the WebSocket to be ready.");
        }
        if (!selectedPlugin) {
            throw new Error("No plugin selected. Please ensure that at least one plugin is initialized.");
        }

        const job = await invokeSyncRequestTyped(ws, "runQuery", {
            instanceId: selectedPlugin.id,
            controllerParams: params,
            searchTerm,
            queryOptions: {
                fromTime: queryOptions.fromTime,
                toTime: queryOptions.toTime,
                limit: queryOptions.limit,
            },
        });
        console.log("Query job started:", job);

        const unsubscribeBatchHandler = ws.subscribe(QueryBatchDoneSchema,
            {
                predicate: (batchMessage) => batchMessage.payload.jobId === job.id,
                callback: (batchMessage) => {
                    queryOptions.onBatchDone(batchMessage.payload.data);
                }
            }
        )

        // setup cancel token
        const cancelToken = queryOptions.cancelToken;
        cancelToken.addEventListener('abort', () => {
            console.log(`Query job ${job.id} cancelled`);
            // Here we can handle the cancellation logic if needed
            // window.electronAPI.query.cancel(job.id);

            invokeSyncRequestTyped(ws, "cancelQuery", {
                taskId: job.id,
            });
        });

        return new Promise((resolve, reject) => {
            if (!ws) {
                throw new Error("WebSocket connection is not established. Please wait for the WebSocket to be ready.");
            }

            const unsubscribeJobUpdateHandler = ws.subscribe(QueryJobUpdatedSchema,
                {
                    predicate: (jobUpdateMessage) => jobUpdateMessage.payload.jobId === job.id,
                    callback: (jobUpdateMessage) => {
                        const jobUpdate = jobUpdateMessage.payload;
                        if (jobUpdate.status === "completed") {
                            console.log(`Job ${jobUpdate.jobId} completed`);
                            resolve();
                        } else {
                            console.log(`Job ${jobUpdate.jobId} updated: ${jobUpdate.status}`);
                            // You can handle other statuses if needed
                            reject(new Error(`Query job ${jobUpdate.jobId} failed with status: ${jobUpdate.status}`));
                        }
                        unsubscribeBatchHandler();
                        unsubscribeJobUpdateHandler();
                    }
                }
            );
        });
    },
}
