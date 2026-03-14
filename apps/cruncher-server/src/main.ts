// Debug file writer — runs before anything else, survives electron-log/IPC failures.
// Writes to the same file as electron-log so it appears in the existing log stream.
import { appendFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
let _LOG_DIR = join(homedir(), "Library", "Logs", "cruncher");
let _DBG = join(_LOG_DIR, "main.log");
const _setLogDir = (dir: string) => {
  _LOG_DIR = dir;
  _DBG = join(_LOG_DIR, "main.log");
};
const _dbg = (msg: string) => {
  const line = `[${new Date().toISOString()}] [debug] (server) ${msg}\n`;
  try { mkdirSync(_LOG_DIR, { recursive: true }); appendFileSync(_DBG, line); } catch { /* ignore */ }
};
_dbg("module top");

import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { EventEmitter } from "node:events";
import { WebSocketServer } from "ws";
import { ExternalAuthProvider } from "@cruncher/adapter-utils";
import { createSignal } from "@cruncher/utils";
import docker from "@cruncher/adapter-docker";
import k8s from "@cruncher/adapter-k8s";
import loki from "@cruncher/adapter-loki";
import grafanaLokiBrowser from "@cruncher/adapter-grafana-loki-browser";
import mock from "@cruncher/adapter-mock";
import coralogix from "@cruncher/adapter-coralogix";
import datadog from "@cruncher/adapter-datadog";
import { Engine } from "./engineV2/engine";
import {
  DefaultExternalAuthProvider,
  ElectronExternalAuthProvider,
} from "./externalAuthProvider";
import { appRouter } from "./plugins_engine/router";
import { createContext } from "./plugins_engine/trpc";
import { IPCMessage } from "./types";
import log from "electron-log/main";
import { appGeneralSettings, readConfig } from "./plugins_engine/config";
import { DEFAULT_MAX_HISTORY_ENTRIES } from "@cruncher/server-shared";
export type { AppRouter } from "./router_messages";

_dbg("before log.initialize");
log.initialize();
_dbg("after log.initialize");
Object.assign(console, log.functions);
_dbg("after Object.assign console");


process.on("uncaughtException", (error: NodeJS.ErrnoException) => {
  if (error.code === "EIO") return; // ignore broken pipe/disconnected stdout
  _dbg(`uncaughtException: ${error.message}\n${error.stack ?? ""}`);
  throw error;
});

process.on("unhandledRejection", (reason) => {
  const msg = reason instanceof Error ? `${reason.message}\n${reason.stack ?? ""}` : String(reason);
  _dbg(`unhandledRejection: ${msg}`);
});
process.on("beforeExit", (code) => {
  _dbg(`beforeExit: ${code}`);
});
process.on("exit", (code) => {
  _dbg(`exit: ${code}`);
});

log.transports.console.level = false; // utility process has no reliable stdio

process.title = "cruncher-server";

const eventEmitter = new EventEmitter();

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

const initializeServer = async (
  authProvider: ExternalAuthProvider,
  opts: { userDataPath?: string; logDir?: string } = {},
) => {
  _dbg("initializeServer start");
  if (opts.logDir) _setLogDir(opts.logDir);
  if (opts.userDataPath) _dbg(`initializeServer userDataPath: ${opts.userDataPath}`);
  if (opts.logDir) _dbg(`initializeServer logDir: ${opts.logDir}`);
  if (opts.logDir) {
    log.transports.file.resolvePath = () => join(opts.logDir as string, "main.log");
  }
  console.log("[server-init] log file:", log.transports.file.getFile().path);
  _dbg("step: readConfig");
  const { config: appConfig } = readConfig(appGeneralSettings);
  _dbg("step: new Engine");
  const engineV2 = new Engine(authProvider, {
    userDataPath: opts.userDataPath,
  });
  _dbg("step: setMaxHistoryEntries");
  engineV2.setMaxHistoryEntries(appConfig.ui?.maxHistoryEntries ?? DEFAULT_MAX_HISTORY_ENTRIES);

  _dbg("step: recoverInterruptedSessions");
  // Mark any sessions that were mid-flight when the process last crashed
  await engineV2.recoverInterruptedSessions();
  _dbg("step: recoverInterruptedSessions done");
  engineV2.startWatchdog();

  _dbg("step: startServer");
  const server = await startServer(engineV2, eventEmitter);

  // TODO: dynamically load supported plugins
  engineV2.registerPlugin(loki);
  engineV2.registerPlugin(grafanaLokiBrowser);
  engineV2.registerPlugin(mock);
  engineV2.registerPlugin(docker);
  engineV2.registerPlugin(k8s);
  engineV2.registerPlugin(coralogix);
  engineV2.registerPlugin(datadog);

  return {
    port: server.port,
  };
};

const sendUrlNavigationMessage = (url: string) => {
  eventEmitter.emit("urlNavigation", url);
};

console.log("Server process started, waiting for IPC messages...");
// Start when run directly or when launched as a utility process (parentPort present).
if (require.main === module || "parentPort" in process) {
  (async () => {
    try {
      if (!("parentPort" in process)) {
        await initializeServer(new DefaultExternalAuthProvider());
      } else {
        (process.parentPort as EventEmitter)?.on("message", async (e) => {
          const [port] = e.ports;
          const initPayload = (e as { data?: unknown }).data as
            | { userDataPath?: string; logDir?: string }
            | undefined;
          _dbg("message handler fired, port received");
          let serverData: { port: number };
          try {
            _dbg("calling initializeServer");
            serverData = await initializeServer(
              new ElectronExternalAuthProvider(port),
              {
                userDataPath: initPayload?.userDataPath,
                logDir: initPayload?.logDir,
              },
            );
            _dbg("initializeServer completed successfully");
          } catch (error) {
            const msg = error instanceof Error
              ? `${error.message}\n${error.stack ?? ""}`
              : String(error);
            _dbg(`FATAL: initializeServer threw: ${msg}`);
            console.error("[server-init] FATAL: initializeServer threw:", msg);
            // Send the error back through the port so the main process can log it
            try { port.postMessage({ type: "initError", error: msg }); } catch { /* ignore */ }
            process.exit(1);
          }

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
      _dbg(`outer catch: ${error instanceof Error ? error.stack : String(error)}`);
      console.error("Error initializing server:", error);
      process.exit(1);
    }
  })();
}
