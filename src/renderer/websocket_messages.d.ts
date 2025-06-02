import { getRoutes } from "src/plugins_engine/websocket";
type Routes = ReturnType<typeof getRoutes>;
export type WebSocketBridge = Awaited<Routes>[number];

export type WebSocketBridgeSyncRequest = Extract<WebSocketBridge, { type: "sync_request_handler" }>;
export type WebSocketBridgeAsyncRequest = Extract<WebSocketBridge, { type: "async_request_handler" }>;

// narrow the type to only include the callback function
export type WebSockerSyncHandler<T extends WebSocketBridge["kind"]> = Extract<WebSocketBridgeSyncRequest, { kind: T }>["_originalCallback"];
export type WebSocketAsyncHandler<T extends WebSocketBridge["kind"]> = Extract<WebSocketBridgeAsyncRequest, { kind: T }>["_originalCallback"];


// create a strongly typed invoke function
export type InvokeWebSocketHandler = <T extends WebSocketBridge["kind"]>(
    consumer: WebsocketClientWrapper,
    kind: T,
    params: Parameters<WebSockerSyncHandler<T>>[0],
) => ReturnType<WebSockerSyncHandler<T>>;

export type AsyncInvokeWebSocketHandler = <T extends WebSocketBridge["kind"]>(
    consumer: WebsocketClientWrapper,
    kind: T,
    params: Parameters<WebSocketAsyncHandler<T>>[0],
) => ReturnType<WebSocketAsyncHandler<T>>;
