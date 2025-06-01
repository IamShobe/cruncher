import { ControllerIndexParam, Search } from '~lib/qql/grammar';
import type { controller, MessageSender } from './controller';
import { QueryTask, SerializeableParams as SerializeableQueryParams } from './types';
import { ProcessedData } from '~lib/adapters/logTypes';
import { BrowserWindow } from 'electron';


export const registerIPCListeners = async (ipcMain: Electron.IpcMain, messageSender: MessageSender) => {
    const { controller } = await import('./controller');
    if (!controller) {
        throw new Error('Controller is not defined. Ensure that the controller is properly imported.');
    }

    ipcMain.handle('getSupportedPlugins', async () => {
        return controller.getSupportedPlugins();
    });

    ipcMain.handle('initializePlugin', async (event, pluginRef: string, name: string, params: Record<string, any>) => {
        return controller.initializePlugin(pluginRef, name, params);
    });

    ipcMain.handle('getInitializedPlugins', async () => {
        return controller.getInitializedPlugins();
    });

    ipcMain.handle('runQuery', async (event, instanceId: string, params: ControllerIndexParam[], search: Search, queryOptions: SerializeableQueryParams) => {
        return controller.runQuery(messageSender, instanceId, params, search, queryOptions);
    });

    ipcMain.handle('cancelQuery', async (event, taskId: string) => {
        return controller.cancelQuery(messageSender, taskId);
    });

    ipcMain.handle('getControllerParams', async (event, instanceId: string) => {
        return await controller.getControllerParams(instanceId);
    });
}

export const registerPreloadIPC = (ipcRenderer: Electron.IpcRenderer) => ({
    plugins: {
        getSupportedPlugins: async () => {
            const result = await ipcRenderer.invoke('getSupportedPlugins');
            return result as ReturnType<typeof controller.getSupportedPlugins>;
        },
        initializePlugin: async (pluginRef: string, params: Record<string, any>) => {
            const result = await ipcRenderer.invoke('initializePlugin', pluginRef, params);
            return result as ReturnType<typeof controller.initializePlugin>;
        },
        getInitializedPlugins: async () => {
            const result = await ipcRenderer.invoke('getInitializedPlugins');
            return result as ReturnType<typeof controller.getInitializedPlugins>;
        },
    },
    query: {
        run: async (instanceId: string, params: ControllerIndexParam[], searchTerm: Search, queryOptions: SerializeableQueryParams) => {
            const result = await ipcRenderer.invoke('runQuery', instanceId, params, searchTerm, queryOptions);
            return result as ReturnType<typeof controller.runQuery>;
        },
        controllerParams: async (instanceId: string) => {
            const result = await ipcRenderer.invoke('getControllerParams', instanceId);
            return result as ReturnType<typeof controller.getControllerParams>;
        },
        cancel: async (taskId: string) => {
            const result = await ipcRenderer.invoke('cancelQuery', taskId);
            return result as ReturnType<typeof controller.cancelQuery>;
        },
        onBatchDone: (registeredJobId: string, callback: (jobId: string, data: ProcessedData[]) => void) => {
            ipcRenderer.on('queryBatchDone', (_event, jobId, data) => {
                if (registeredJobId !== jobId) {
                    return; // Ignore batches for other jobs
                }

                callback(jobId, data);
            });
        },
        onJobUpdated: (jobId: string, callback: (job: QueryTask) => void) => {
            ipcRenderer.on('queryJobUpdated', (_event, job) => {
                if (job.id !== jobId) {
                    return; // Ignore updates for other jobs
                }

                callback(job);
            });
        },
    }
});

export const getMessageSender = (window: BrowserWindow): MessageSender => ({
    batchDone: (jobId: string, data: ProcessedData[]) => {
        window.webContents.send('queryBatchDone', jobId, data);
    },
    jobUpdated: (job) => {
        window.webContents.send('queryJobUpdated', job);
    }
});
