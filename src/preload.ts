// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// Preload (Isolated World)
import { contextBridge, ipcRenderer } from 'electron';

export const electronAPI = {
  getPort: async () => {
    return await ipcRenderer.invoke('getPort') as Promise<number>;
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
