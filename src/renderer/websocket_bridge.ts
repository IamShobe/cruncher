import { QueryProvider } from "~core/common/interface";
import { getWebsocketConnection, invokeSyncRequest as originalSyncInvoke, invokeAsyncRequest as originalAsyncInvoke } from "~lib/websocket/client";
import type { InvokeWebSocketHandler, AsyncInvokeWebSocketHandler } from "./websocket_messages"
import { PluginInstance } from "src/plugins_engine/types";
import { QueryBatchDoneSchema, QueryJobUpdatedSchema, UrlNavigationSchema } from "src/plugins_engine/protocol_out";
import { createSignal, parseDate } from "~lib/utils";
import { store } from "~core/store/store";
import { endFullDateAtom, startFullDateAtom } from "~core/store/dateState";
import { searchQueryAtom } from "~core/store/queryState";
import { runQuery } from "~core/search";

const invokeSyncRequestTyped: InvokeWebSocketHandler = (ws, method, params) => {
    return originalSyncInvoke(ws, method, params) as any;
};

const invokeAsyncRequestTyped: AsyncInvokeWebSocketHandler = (ws, message, params) => {
    return originalAsyncInvoke(ws, message, params) as any;
};

// @ts-ignore
window.invokeSyncRequestTyped = (method, params) => invokeSyncRequestTyped(ws, method, params); // Expose the WebSocket connection globally for debugging
// @ts-ignore
window.invokeAsyncRequestTyped = (message, params) => invokeAsyncRequestTyped(ws, message, params); // Expose the WebSocket connection globally for debugging

let ws: ReturnType<typeof getWebsocketConnection> | undefined = undefined;
let selectedPlugin: PluginInstance | undefined = undefined;

const websocketReadySignal = createSignal();

const setup = async () => {
    ws = getWebsocketConnection(`ws://localhost:${await window.electronAPI.getPort()}`);

    ws.onReady(async () => {
        console.log("WebSocket connection established");

        const response = await invokeSyncRequestTyped(ws, "getSupportedPlugins", {})
        console.log("Supported plugins:", response);

        const initializedPlugins = await invokeSyncRequestTyped(ws, "getInitializedPlugins", {});
        if (initializedPlugins.length === 0) {
            console.warn("No plugins initialized, initializing default plugin...");
            return;
        }

        selectedPlugin = initializedPlugins[0];
        websocketReadySignal.signal();
    })

    ws.subscribe(
        (message: any) => {
            const parseResponse = UrlNavigationSchema.safeParse(message);
            if (!parseResponse.success) {
                return false; // Ignore messages that are not query job updates
            }
            return true; // Process this message
        },
        (message: any) => {
            const urlNavigationMessage = UrlNavigationSchema.parse(message);
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
    )
}
setup()

export const WEBSOCKET_BRIDGE: QueryProvider = {
    waitForReady: async () => {
        return await websocketReadySignal.wait();
    },
    getControllerParams: async () => {
        if (!selectedPlugin) {
            throw new Error("No plugin selected. Please ensure that at least one plugin is initialized.");
        }

        return await invokeSyncRequestTyped(ws, "getControllerParams", { instanceId: selectedPlugin.id });
    },
    query: async (params, searchTerm, queryOptions) => {
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

        const unsubscribeBatchHandler = ws.subscribe(
            (message: any) => {
                const parseResponse = QueryBatchDoneSchema.safeParse(message);
                if (!parseResponse.success) {
                    return false; // Ignore messages that are not query batch done
                }
                if (parseResponse.data.payload.jobId !== job.id) {
                    return false; // Ignore messages for other jobs
                }

                return true;
            },
            (message: any) => {
                const batchMessage = QueryBatchDoneSchema.parse(message);
                queryOptions.onBatchDone(batchMessage.payload.data);
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

            const unsubscribeJobUpdateHandler = ws.subscribe(
                (message: any) => {
                    const parseResponse = QueryJobUpdatedSchema.safeParse(message);
                    if (!parseResponse.success) {
                        return false; // Ignore messages that are not query batch done
                    }
                    if (parseResponse.data.payload.jobId !== job.id) {
                        return false; // Ignore messages for other jobs
                    }

                    return true;
                },
                (message: any) => {
                    const jobUpdateMessage = QueryJobUpdatedSchema.parse(message);
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
            );
        });
    },
}
