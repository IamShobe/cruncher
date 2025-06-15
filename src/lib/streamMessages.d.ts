import { getRoutes } from "src/plugins_engine/router";
type Routes = ReturnType<typeof getRoutes>;
export type StreamBridge = Awaited<Routes>[number];

export type StreamBridgeSyncRequest = Extract<StreamBridge, { type: "sync_request_handler" }>;
export type StreamBridgeAsyncRequest = Extract<StreamBridge, { type: "async_request_handler" }>;

// narrow the type to only include the callback function
export type StreamSyncHandler<T extends StreamBridgeSyncRequest["kind"]> = Extract<StreamBridgeSyncRequest, { kind: T }>["_originalCallback"];
export type StreamAsyncHandler<T extends StreamBridgeAsyncRequest["kind"]> = Extract<StreamBridgeAsyncRequest, { kind: T }>["_originalCallback"];
