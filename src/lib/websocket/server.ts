import { pack, unpack } from "msgpackr";
import { WebSocketServer, WebSocket } from "ws";
import {
  GenericMessageSchema,
  ResponseHandler,
  SyncErrorOut,
  SyncRequestIn,
  SyncRequestInSchema,
  SyncResponseOut,
} from "~lib/networkTypes";
import { atLeastOneConnectionSignal } from "~lib/utils";

export type Consumer = {
  type: string;
  callback: (message: unknown) => void;
};

export type UnsubscribeFunction = () => void;

export type EngineServer = ResponseHandler & {
  onMessage: (callback: (message: unknown) => void) => UnsubscribeFunction;
};

export const getSyncRequestHandler = <
  T extends string,
  P extends object,
  R extends object,
>(
  kind: T,
  callback: (params: P) => Promise<R>
) => {
  return {
    type: "sync_request_handler",
    kind,
    _originalCallback: callback,
    callback: (server: EngineServer, request: SyncRequestIn) => {
      const onError = (error: unknown) => {
        if (!(error instanceof Error)) {
          throw new Error("An unexpected error occurred");
        }
        const response: SyncErrorOut = {
          type: "sync_error",
          uuid: request.uuid,
          payload: {
            error: error?.message || "An error occurred",
            details: error?.stack || undefined,
          },
        };
        server.sendMessage(response);
      };
      try {
        const params = request.payload;
        callback(params)
          .then((result) => {
            const response: SyncResponseOut = {
              type: "sync_response",
              uuid: request.uuid,
              payload: result,
            };
            server.sendMessage(response);
          })
          .catch(onError);
      } catch (error) {
        onError(error);
      }
    },
  } as const;
};

export const getAsyncRequestHandler = <P extends object>(
  kind: string,
  callback: (params: P) => Promise<void>
) => {
  return {
    type: "async_request_handler",
    kind,
    _originalCallback: callback,
    callback: (request: unknown) => {
      callback(request as P)
        .then(() => {})
        .catch(() => {});
    },
  } as const;
};

export const getServer = () => {
  return new Promise<
    EngineServer & {
      server: WebSocketServer;
      port: number;
      addConsumer: (consumer: Consumer) => void;
      removeConsumer: (consumer: Consumer) => void;
    }
  >((resolve, reject) => {
    const wss = new WebSocketServer({
      host: "localhost", // Change to your desired host
      port: 0, // Use 0 to let the OS assign a free port
    });

    const consumers: Consumer[] = [];

    const connectionsSignal = atLeastOneConnectionSignal();

    wss.on("connection", (ws) => {
      // new connection established
      console.log("New client connected");
      connectionsSignal.increment();

      ws.on("close", () => {
        console.log("Client disconnected");
        // Optionally handle client disconnection
        connectionsSignal.decrement();
      });

      ws.on("message", (message) => {
        // Here you can handle incoming messages
        try {
          const rawMessage = message instanceof Buffer ? message : null;
          if (!rawMessage) {
            console.warn("Received empty or invalid message:", message);
            return;
          }

          const parsedMessage = unpack(rawMessage);
          if (!parsedMessage) {
            console.warn("Received empty or invalid message:", rawMessage);
            return;
          }
          // Process the parsed message as needed
          consumers.forEach((consumer) => {
            consumer.callback(parsedMessage);
          });
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      });
    });

    const sendMessage = async (message: unknown) => {
      const serializedMessage = pack(message);
      // wait for at least one connection to be established
      await connectionsSignal.isReady();
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(serializedMessage);
        }
      });
    };

    const addConsumer = (consumer: Consumer) => {
      consumers.push(consumer);
    };
    const removeConsumer = (consumer: Consumer) => {
      const index = consumers.findIndex(
        (c) => c.type === consumer.type && c.callback === consumer.callback
      );
      if (index !== -1) {
        consumers.splice(index, 1);
      }
    };

    // get the assigned port
    wss.on("listening", () => {
      const address = wss.address();
      if (!address) {
        reject(new Error("WebSocket server address is not available"));
        return;
      }

      let port: number;
      if (typeof address === "string") {
        const url = new URL(address);
        port = parseInt(url.port);
      } else {
        port = address.port;
      }

      resolve({
        server: wss,
        port: port,
        waitUntilReady: connectionsSignal.isReady,
        addConsumer: addConsumer,
        removeConsumer: removeConsumer,
        sendMessage: sendMessage,
        onMessage: (callback: (message: unknown) => void) => {
          const consumer: Consumer = {
            type: "message",
            callback: callback,
          };
          addConsumer(consumer);

          return () => {
            removeConsumer(consumer);
          };
        },
      });
    });
  });
};

type WithoutOriginalCallback<T> = Omit<T, "_originalCallback">;
type AsyncRoute = WithoutOriginalCallback<
  ReturnType<typeof getAsyncRequestHandler>
>;
type SyncRoute = WithoutOriginalCallback<
  ReturnType<typeof getSyncRequestHandler>
>;

type RouteType = AsyncRoute | SyncRoute;

export const setupEngine = async (
  server: EngineServer,
  routes: readonly RouteType[]
) => {
  server.onMessage((message) => {
    try {
      const parsedMessage = GenericMessageSchema.parse(message);
      if (parsedMessage.type === "sync_request") {
        const request = SyncRequestInSchema.parse(message);

        routes.forEach((handler) => {
          if (handler.kind !== request.kind) {
            return; // Not a sync request of the expected kind
          }

          handler.callback(server, request);
        });
      } else {
        // assume it's an async request
        const asyncHandler = routes.find<AsyncRoute>(
          (handler): handler is AsyncRoute =>
            handler.type === "async_request_handler" &&
            handler.kind === parsedMessage.type
        );
        if (!asyncHandler) {
          console.warn(
            "No handler found for message type:",
            parsedMessage.type
          );
          return;
        }

        asyncHandler.callback(parsedMessage.payload);
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });
};
