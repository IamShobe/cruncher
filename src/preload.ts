// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// Preload (Isolated World)
import { contextBridge, ipcRenderer } from 'electron';
import { registerPreloadIPC } from './plugins_engine/ipc';

export const electronAPI = {
  getPort: async () => {
    return await ipcRenderer.invoke('getPort') as Promise<number>;
  },
  ...registerPreloadIPC(ipcRenderer),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
