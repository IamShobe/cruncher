import { compare } from 'compare-versions';
import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import log from 'electron-log/main';
import started from 'electron-squirrel-startup';
import path from 'node:path';
import { ResponseHandler } from '~lib/networkTypes';
import { createSignal } from '~lib/utils';
import { getServer, setupEngine } from './lib/websocket/server';
import { getRoutes, newUrlNavigationMessage } from './plugins_engine/router';

// Optional, initialize the logger for any renderer process
log.initialize();
Object.assign(console, log.functions);

const updateServer = "https://cruncher-upstream.vercel.app";
const repoHome = "https://github.com/IamShobe/cruncher"
const feedChannel = `${process.platform}_${process.arch}`;
const updateUrl = `${updateServer}/update/${feedChannel}/0.0.0`

console.log("feed URL for autoUpdater:", updateUrl);

const version = app.getVersion();
console.log(`Cruncher version: ${version}`);

const checkForUpdates = async () => {
  console.log("Checking for updates...");
  const fetchResponse = await fetch(updateUrl)
  if (!fetchResponse.ok) {
    console.error("Failed to fetch update information:", fetchResponse.statusText);
    return;
  }

  const respData = await fetchResponse.json();

  const latestVersion = respData.name;
  const latestAvailableVersion = latestVersion.trim().replace(/^v/, '');

  if (compare(latestAvailableVersion, version, '>')) {
    console.log(`A new version is available: ${latestVersion}`);
    dialog.showMessageBox({
      type: 'info',
      buttons: ['Go to release page', 'Later'],
      title: 'Application Update',
      message: `Version ${latestVersion} is available!`,
      detail: 'A new version of Cruncher is available. Would you like to go to the release page to download it?'
    }).then((returnValue) => {
      if (returnValue.response === 0) {
        const releaseUrl = `${repoHome}/releases/tag/${latestVersion}`;
        shell.openExternal(releaseUrl);
      }
    })
  }
}

checkForUpdates()

// log workdir 
console.log(`Current working directory: ${process.cwd()}`);

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('cruncher', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('cruncher')
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
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'icons', 'png', 'icon.png'),
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

let messageSender: ResponseHandler | undefined = undefined;
const messageSenderReady = createSignal();
function isDev() {
  return !app.getAppPath().includes('app.asar');
}

const ready = async () => {
  // get free port
  const serverContainer = await getServer();
  console.log(`Server is running on port ${serverContainer.port}`);
  // messageSender = getWebsocketMessageSender(serverContainer);
  messageSender = serverContainer;
  messageSenderReady.signal();
  const routes = await getRoutes(serverContainer);
  await setupEngine(serverContainer, routes);
  ipcMain.handle('getPort', async () => {
    return serverContainer.port;
  });

  ipcMain.handle('getVersion', async () => {
    return {
      "tag": app.getVersion(),
      "isDev": isDev(),
    }
  });

  createWindow();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, commandLine: string[], _workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }

    messageSenderReady.wait().then(() => {
      if (!messageSender) {
        console.warn("Message sender is not initialized yet, cannot handle open-url event");
        return;
      }
      messageSender.sendMessage(newUrlNavigationMessage(commandLine[1])); // Assuming the URL is the second argument
    })
  })

  // Create mainWindow, load the rest of the app, etc...
  app.whenReady().then(() => {
    ready();
  })

  app.on('open-url', (event, url) => {
    messageSenderReady.wait().then(() => {
      if (!messageSender) {
        console.warn("Message sender is not initialized yet, cannot handle open-url event");
        return;
      }

      messageSender.sendMessage(newUrlNavigationMessage(url)); // Assuming the URL is the second argument
    });
  })
}

// const onUrl = (url: string) => {
//   const parsedUrl = new URL(url);
//   const source = parsedUrl.hostname;
//   const query = parsedUrl.searchParams.get('query');
//   const startTime = parsedUrl.searchParams.get('startTime');
//   const endTime = parsedUrl.searchParams.get('endTime');
// }

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
