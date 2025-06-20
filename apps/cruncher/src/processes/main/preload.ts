// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// Preload (Isolated World)
import { contextBridge, ipcRenderer } from "electron";

export const electronAPI = {
  getPort: async () => {
    return (await ipcRenderer.invoke("getPort")) as Promise<number>;
  },
  getVersion: async () => {
    return (await ipcRenderer.invoke("getVersion")) as Promise<{
      tag: string;
      isDev: boolean;
    }>;
  },
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
