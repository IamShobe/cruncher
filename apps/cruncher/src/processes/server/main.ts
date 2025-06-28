import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { EventEmitter } from "node:events";
import { WebSocketServer } from "ws";
import { ExternalAuthProvider } from "@cruncher/adapter-utils";
import { createSignal } from "@cruncher/utils";
import docker from "@cruncher/adapter-docker";
import loki from "@cruncher/adapter-loki";
import grafanaLokiBrowser from "@cruncher/adapter-grafana-loki-browser";
import mock from "@cruncher/adapter-mock";
import coralogix from "@cruncher/adapter-coralogix";
import { Engine } from "./engineV2/engine";
import {
  DefaultExternalAuthProvider,
  ElectronExternalAuthProvider,
} from "./externalAuthProvider";
import { appRouter } from "./plugins_engine/router";
import { createContext } from "./plugins_engine/trpc";
import { IPCMessage } from "./types";
import log from "electron-log/main";
import { init as initLoki } from "./loki/runner";
import { appGeneralSettings, readConfig } from "./plugins_engine/config";
export type { AppRouter } from "./plugins_engine/router_messages";

log.initialize();
Object.assign(console, log.functions);

process.title = "cruncher-server";

const eventEmitter = new EventEmitter();

// let serverContainer: Awaited<ReturnType<typeof getServer>> | undefined =
//   undefined;
const messageSenderReady = createSignal();

const startServer = async (engineV2: Engine, eventEmitter: EventEmitter) => {
  const wss = new WebSocketServer({
    host: "localhost",
    port: 0,
  });
  const handler = applyWSSHandler({
    wss,
    router: appRouter,
    createContext: () => createContext(engineV2, eventEmitter),
    keepAlive: {
      enabled: true,
      // server ping message interval in milliseconds
      pingMs: 30000,
      // connection is terminated if pong message is not received in this many milliseconds
      pongWaitMs: 5000,
    },
  });

  wss.on("close", () => {
    console.log("WebSocket server closed");
    process.removeListener("SIGTERM", onSigTerm);
  });

  const onSigTerm = () => {
    console.log("SIGINT");
    handler.broadcastReconnectNotification();
    wss.close();
  };
  process.on("SIGINT", onSigTerm);

  return new Promise<{ server: WebSocketServer; port: number }>(
    (resolve, reject) => {
      wss.on("error", (err) => {
        console.error("WebSocket server error:", err);
        reject(err);
      });
      wss.on("listening", () => {
        const address = wss.address();
        if (typeof address === "string") {
          console.error(
            "WebSocket server address is a string, cannot determine port",
          );
          reject(new Error("WebSocket server address is a string"));
          return;
        }
        const port = address?.port;
        if (port === undefined) {
          reject(new Error("Server address does not have a port"));
          return;
        }
        resolve({ server: wss, port: port });
        console.log(`Server is listening on port ${port}`);
        messageSenderReady.signal();
      });
    },
  );
};

const initializeServer = async (authProvider: ExternalAuthProvider) => {
  const config = readConfig(appGeneralSettings);
  initLoki(config.loki).catch((error) => {
    console.error("Failed to initialize Loki:", error);
  });
  console.log("Initializing server...");
  // get free port
  //   serverContainer = await getServer();
  //   console.log(`Server is running on port ${serverContainer.port}`);
  // messageSender = getWebsocketMessageSender(serverContainer);
  const engineV2 = new Engine(authProvider);
  const server = await startServer(engineV2, eventEmitter);

  //   messageSender = serverContainer;

  // TODO: dynamically load supported plugins
  engineV2.registerPlugin(loki);
  engineV2.registerPlugin(grafanaLokiBrowser);
  engineV2.registerPlugin(mock);
  engineV2.registerPlugin(docker);
  engineV2.registerPlugin(coralogix);

  //   const routes = await getRoutes(engineV2);
  //   await setupEngine(serverContainer, routes);

  return {
    port: server.port,
  };
};

const sendUrlNavigationMessage = (url: string) => {
  eventEmitter.emit("urlNavigation", url);
};

console.log("Server process started, waiting for IPC messages...");
// If this file is run directly, start the server and listen for IPC messages
if (require.main === module) {
  (async () => {
    try {
      if (!("parentPort" in process)) {
        await initializeServer(new DefaultExternalAuthProvider());
      } else {
        (process.parentPort as EventEmitter)?.on("message", async (e) => {
          const [port] = e.ports;
          const serverData = await initializeServer(
            new ElectronExternalAuthProvider(port),
          );

          console.log("Server is online!");

          port.on("message", (e: Electron.MessageEvent) => {
            const msg = e.data as IPCMessage;
            if (!msg || typeof msg !== "object" || !("type" in msg)) return;
            if (msg.type === "authResult") {
              // safety check for authResult - don't handle it here!
              return;
            }

            const handlers = {
              getPort: () => {
                console.log(
                  "Received getPort message, port is",
                  serverData.port,
                );
                port.postMessage({ type: "port", port: serverData.port });
              },
              navigateUrl: (msg: IPCMessage) => {
                if (typeof msg.url === "string")
                  sendUrlNavigationMessage(msg.url);
              },
            } as const;

            if (!(msg.type in handlers)) {
              return;
            }

            console.log(`Received IPC message: ${msg.type}`, msg);
            const handler = handlers[msg.type as keyof typeof handlers];
            handler(msg);
          });
          port.start();
          console.log("Port started, sending ready message...");
          port.postMessage({ type: "ready", port: serverData.port });
          console.log("Ready message sent, server is initialized.");
        });
      }
    } catch (error) {
      console.error("Error initializing server:", error);
      process.exit(1);
    }
  })();
}
