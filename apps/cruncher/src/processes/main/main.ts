import chokidar, { FSWatcher } from "chokidar";
import { compare } from "compare-versions";
import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  MessageChannelMain,
  MessagePortMain,
  shell,
  UtilityProcess,
  utilityProcess,
} from "electron";
import log from "electron-log/main";
import started from "electron-squirrel-startup";
import fs from "node:fs";
import path from "node:path";
import { createAuthWindow } from "./utils/auth";
import { isIpcMessage } from "./utils/ipc";
import { requestFromServer } from "./utils/requestFromServer";

// Optional, initialize the logger for any renderer process
log.initialize();
Object.assign(console, log.functions);

process.on("uncaughtException", (error: NodeJS.ErrnoException) => {
  if (error.code === "EIO") return; // ignore broken pipe/disconnected stdout
  throw error;
});

const _isDev = !app.getAppPath().includes("app.asar");
if (!_isDev) {
  log.transports.console.level = false;
}

const updateServer = "https://cruncher-upstream.vercel.app";
const repoHome = "https://github.com/IamShobe/cruncher";
const feedChannel = `${process.platform}_${process.arch}`;
const updateUrl = `${updateServer}/update/${feedChannel}/0.0.0`;

console.log("feed URL for autoUpdater:", updateUrl);

const version = app.getVersion();
console.log(`Cruncher version: ${version}`);
const logDir = app.getPath("logs");
log.transports.file.resolvePath = () => path.join(logDir, "main.log");
console.log(`Log file: ${log.transports.file.getFile().path}`);

const checkForUpdates = async () => {
  console.log("Checking for updates...");
  const fetchResponse = await fetch(updateUrl);
  if (!fetchResponse.ok) {
    console.error(
      "Failed to fetch update information:",
      fetchResponse.statusText,
    );
    return;
  }

  const respData = await fetchResponse.json();

  const latestVersion = respData.name;
  const latestAvailableVersion = latestVersion.trim().replace(/^v/, "");

  if (compare(latestAvailableVersion, version, ">")) {
    console.log(`A new version is available: ${latestVersion}`);
    dialog
      .showMessageBox({
        type: "info",
        buttons: ["Go to release page", "Later"],
        title: "Application Update",
        message: `Version ${latestVersion} is available!`,
        detail:
          "A new version of Cruncher is available. Would you like to go to the release page to download it?",
      })
      .then((returnValue) => {
        if (returnValue.response === 0) {
          const releaseUrl = `${repoHome}/releases/tag/${latestVersion}`;
          shell.openExternal(releaseUrl);
        }
      });
  }
};

checkForUpdates();

// log workdir
console.log(`Current working directory: ${process.cwd()}`);

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient("cruncher", process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient("cruncher");
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}
let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 560,
    minHeight: 600,
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "icons", "png", "icon.png"),
  });
  mainWindow.setMenuBarVisibility(false);
  mainWindow.webContents.on(
    "console-message",
    (_event, level, message, line, sourceId) => {
      const levelName =
        ["debug", "info", "warn", "error"][level] ?? `level:${level}`;
      log.info(`[renderer:${levelName}] ${message} (${sourceId}:${line})`);
    },
  );
  mainWindow.webContents.on("did-finish-load", () => {
    log.info("Renderer did-finish-load");
  });
  mainWindow.webContents.on("did-fail-load", (_event, code, desc, url) => {
    log.error(`Renderer did-fail-load: ${code} ${desc} ${url}`);
  });
  mainWindow.webContents.on("render-process-gone", (_event, details) => {
    log.error(
      `Renderer process gone: ${details.reason} (exitCode=${details.exitCode})`,
    );
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

function isDev() {
  return !app.getAppPath().includes("app.asar");
}

let serverProcess: UtilityProcess | null = null;
let serverReady: Promise<void> | null = null;
let serverWatcher: FSWatcher | null = null;
let port: MessagePortMain | null = null;
let shouldRestartServer = true;
let processActive = false;
let serverStdoutBuffer: string[] = [];
let serverStderrBuffer: string[] = [];
const MAX_SERVER_LOG_LINES = 200;

function startServerProcess() {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }

  console.log("Starting server process...");
  const devServerEntry = path.resolve(
    app.getAppPath(),
    "..",
    "cruncher-server",
    "dist",
    "server.js",
  );
  const serverEntry = isDev()
    ? devServerEntry
    : path.join(process.resourcesPath, "server", "dist", "server.js");
  if (!fs.existsSync(serverEntry)) {
    const msg = `Server entry not found: ${serverEntry}`;
    console.error(msg);
    dialog.showErrorBox("FATAL ERROR", msg);
    return;
  }
  const serverCwd = path.dirname(serverEntry);
  serverProcess = utilityProcess.fork(serverEntry, [], {
    execArgv: isDev() ? ["--inspect=9230"] : [],
    stdio: "pipe",
    cwd: serverCwd,
  });
  serverStdoutBuffer = [];
  serverStderrBuffer = [];
  serverProcess.stdout?.on("data", (d: Buffer) => {
    const line = d.toString().trim();
    if (line) {
      serverStdoutBuffer.push(line);
      if (serverStdoutBuffer.length > MAX_SERVER_LOG_LINES)
        serverStdoutBuffer.shift();
      console.log("[server-stdout]", line);
    }
  });
  serverProcess.stderr?.on("data", (d: Buffer) => {
    const line = d.toString().trim();
    if (line) {
      serverStderrBuffer.push(line);
      if (serverStderrBuffer.length > MAX_SERVER_LOG_LINES)
        serverStderrBuffer.shift();
      console.error("[server-stderr]", line);
    }
  });
  processActive = true;

  const thisProcess = serverProcess;
  serverProcess.on("exit", (code) => {
    console.log(`Server process exited with code: ${code}`);
    if (code !== 0) {
      if (serverStdoutBuffer.length) {
        console.error(
          "[server-exit] last stdout lines:\n" + serverStdoutBuffer.join("\n"),
        );
      }
      if (serverStderrBuffer.length) {
        console.error(
          "[server-exit] last stderr lines:\n" + serverStderrBuffer.join("\n"),
        );
      }
    }
    processActive = false;
    if (code !== 0) {
      dialog.showErrorBox(
        "FATAL ERROR",
        `Server process exited with code: ${code}`,
      );
      // Only reset shared state if we are still the active server process.
      // A chokidar-triggered restart may have already replaced these with new
      // values before this exit event fires.
      if (serverProcess === thisProcess) {
        serverProcess = null;
        serverReady = null;
        port = null;

        // Optionally, restart the server process
        if (!shouldRestartServer) return;
        setTimeout(() => {
          console.log("Restarting server process...");
          startServerProcess();
        }, 1000); // Restart after 1 second
      }
    }
  });
  const { port1, port2 } = new MessageChannelMain();
  // check if forked process is running
  serverProcess.on("error", (err) => {
    console.error("Failed to start server process:", err);
    dialog.showErrorBox(
      "FATAL ERROR",
      `Failed to start server process: ${err}`,
    );
    port1.close();
    port2.close();
    serverProcess = null;
    serverReady = null;
  });
  serverProcess.postMessage(
    { type: "init", userDataPath: app.getPath("userData"), logDir },
    [port1],
  );

  port2.on("message", async (payload) => {
    const msg = payload.data;
    if (isIpcMessage(msg) && msg.type === "initError") {
      console.error("[server-process] FATAL init error:\n", msg.error);
      return;
    }
    if (isIpcMessage(msg) && msg.type === "getAuth") {
      const authUrl = msg.authUrl as string;
      const requestedCookies = msg.cookies as string[];
      const jobId = msg.jobId as string;
      const scriptExtractors = (msg.scriptExtractors ?? []) as {
        key: string;
        js: string;
        waitForResult?: boolean;
        runOnNavigation?: boolean;
      }[];
      console.log(
        "Received authentication request from server process, sending cookies...",
      );

      try {
        await createAuthWindow(
          authUrl,
          requestedCookies,
          async (cookies) => {
            const result = await requestFromServer<{
              type: string;
              status: boolean;
            }>(
              port2,
              { type: "authResult", jobId: jobId, cookies: cookies },
              "authResult",
            );

            return result.status;
          },
          scriptExtractors,
        );
      } catch (error) {
        if (processActive) {
          console.error("Error during authentication", error);
        } else {
          console.warn(
            "Server process is not active, skipping authentication error handling.",
          );
        }
      }
    }
  });

  port2.start();
  port = port2;

  serverReady = requestFromServer<void>(
    port2,
    {}, // No request message needed, just wait for the first 'ready' message
    "ready",
  );
}

// Cleanup on quit
app.on("before-quit", () => {
  log.info("App before-quit fired");
  if (serverProcess) {
    console.log("Killing child process...");
    shouldRestartServer = false; // Prevent automatic restart
    serverProcess.kill(); // or .kill('SIGTERM')
  }
});
app.on("will-quit", () => {
  log.info("App will-quit fired");
});
app.on("quit", (_event, exitCode) => {
  log.info(`App quit fired with exitCode=${exitCode}`);
});

if (isDev()) {
  const serverJsPath = path.resolve(
    app.getAppPath(),
    "..",
    "cruncher-server",
    "dist",
    "server.js",
  );
  if (!serverWatcher) {
    serverWatcher = chokidar.watch(serverJsPath, { ignoreInitial: true });
    serverWatcher.on("change", () => {
      log.info("Detected change in server.js, restarting server process...");
      startServerProcess();
    });
  }
}

const ready = async () => {
  if (!serverProcess) startServerProcess();

  // Register all IPC handlers immediately so they are available even while
  // the server process is still initialising.  Handlers that depend on the
  // server await serverReady internally.
  ipcMain.handle("openExternal", (_event, url: string) => {
    shell.openExternal(url);
  });

  ipcMain.handle("getPort", async () => {
    await serverReady; // Ensure the server is ready before requesting the port
    const msg = await requestFromServer<{ type: string; port: number }>(
      port,
      { type: "getPort" },
      "port",
    );
    return msg.port;
  });

  ipcMain.handle("getVersion", async () => {
    try {
      return { tag: version, isDev: isDev() };
    } catch {
      return { tag: "unknown", isDev: isDev() };
    }
  });

  console.log("Waiting for server process to be ready...");
  await serverReady;

  createWindow();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (_event, commandLine: string[]) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    serverReady?.then(() => {
      port?.postMessage({ type: "navigateUrl", url: commandLine[1] });
    });
  });

  // Create mainWindow, load the rest of the app, etc...
  app.whenReady().then(() => {
    ready();
  });

  app.on("open-url", (event, url) => {
    serverReady?.then(() => {
      port?.postMessage({ type: "navigateUrl", url });
    });
  });
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  log.info("App window-all-closed fired");
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
