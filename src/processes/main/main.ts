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
import path from "node:path";
import { createAuthWindow } from "./utils/auth";
import { isIpcMessage } from "./utils/ipc";
import { requestFromServer } from "./utils/requestFromServer";

// Optional, initialize the logger for any renderer process
log.initialize();
Object.assign(console, log.functions);

const updateServer = "https://cruncher-upstream.vercel.app";
const repoHome = "https://github.com/IamShobe/cruncher";
const feedChannel = `${process.platform}_${process.arch}`;
const updateUrl = `${updateServer}/update/${feedChannel}/0.0.0`;

console.log("feed URL for autoUpdater:", updateUrl);

const version = app.getVersion();
console.log(`Cruncher version: ${version}`);

const checkForUpdates = async () => {
  console.log("Checking for updates...");
  const fetchResponse = await fetch(updateUrl);
  if (!fetchResponse.ok) {
    console.error(
      "Failed to fetch update information:",
      fetchResponse.statusText
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
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "icons", "png", "icon.png"),
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
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

function startServerProcess() {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }

  console.log("Starting server process...");
  serverProcess = utilityProcess.fork(path.join(__dirname, "server.js"), [], {
    execArgv: isDev() ? ["--inspect=9230"] : [],
  });
  processActive = true;

  serverProcess.on("exit", (code) => {
    console.log(`Server process exited with code: ${code}`);
    processActive = false;
    if (code !== 0) {
      dialog.showErrorBox(
        "FATAL ERROR",
        `Server process exited with code: ${code}`
      );
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
  });
  const { port1, port2 } = new MessageChannelMain();
  // check if forked process is running
  serverProcess.on("error", (err) => {
    console.error("Failed to start server process:", err);
    dialog.showErrorBox(
      "FATAL ERROR",
      `Failed to start server process: ${err}`
    );
    port1.close();
    port2.close();
    serverProcess = null;
    serverReady = null;
  });
  serverProcess.postMessage({ type: "init" }, [port1]);

  port2.on("message", async (payload) => {
    const msg = payload.data;
    if (isIpcMessage(msg) && msg.type === "getAuth") {
      const authUrl = msg.authUrl as string;
      const requestedCookies = msg.cookies as string[];
      const jobId = msg.jobId as string;
      console.log(
        "Received authentication request from server process, sending cookies..."
      );

      try {
        await createAuthWindow(authUrl, requestedCookies, async (cookies) => {
          const result = await requestFromServer<{
            type: string;
            status: boolean;
          }>(
            port2,
            { type: "authResult", jobId: jobId, cookies: cookies },
            "authResult"
          );

          return result.status;
        });
      } catch (error) {
        if (processActive) {
          console.error("Error during authentication", error);
        } else {
          console.warn(
            "Server process is not active, skipping authentication error handling."
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
    "ready"
  );
}

// Cleanup on quit
app.on("before-quit", () => {
  if (serverProcess) {
    console.log("Killing child process...");
    shouldRestartServer = false; // Prevent automatic restart
    serverProcess.kill(); // or .kill('SIGTERM')
  }
});

if (isDev()) {
  const serverJsPath = path.join(__dirname, "server.js");
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
  console.log("Waiting for server process to be ready...");
  await serverReady;

  // --- IPC Handlers ---

  ipcMain.handle("getPort", async () => {
    await serverReady; // Ensure the server is ready before requesting the port
    const msg = await requestFromServer<{ type: string; port: number }>(
      port,
      { type: "getPort" },
      "port"
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
