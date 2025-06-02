import { app, BrowserWindow, ipcMain } from 'electron';
import log from 'electron-log/main';
import started from 'electron-squirrel-startup';
import path from 'node:path';
import { createSignal } from '~lib/utils';
import { getServer, setupEngine } from './lib/websocket/server';
import { MessageSender, setupPluginsFromConfig } from './plugins_engine/controller';
import { getRoutes, getMessageSender as getWebsocketMessageSender } from './plugins_engine/websocket';

// Optional, initialize the logger for any renderer process
log.initialize();
Object.assign(console, log.functions);

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

let messageSender: MessageSender | undefined = undefined;
const messageSenderReady = createSignal();

const ready = async () => {
  // get free port
  const serverContainer = await getServer();
  console.log(`Server is running on port ${serverContainer.port}`);
  messageSender = getWebsocketMessageSender(serverContainer);
  messageSenderReady.signal();
  const routes = await getRoutes(messageSender);
  await setupEngine(serverContainer, routes);
  ipcMain.handle('getPort', async () => {
    return serverContainer.port;
  });

  setupPluginsFromConfig();
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
      messageSender.urlNavigate(commandLine[1]); // Assuming the URL is the second argument
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
      messageSender.urlNavigate(url); // Assuming the URL is the second argument
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
