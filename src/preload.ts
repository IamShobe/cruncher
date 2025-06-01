// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// Preload (Isolated World)
import { contextBridge, ipcRenderer } from 'electron';
import { registerPreloadIPC } from './plugins_engine/ipc';

export const electronAPI = {
  ...registerPreloadIPC(ipcRenderer),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
