import { InstanceRef, PluginInstance, SerializableAdapter } from 'src/engineV2/types';
import { AppGeneralSettings } from 'src/plugins_engine/controller';
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import { notifyError } from '~core/notifyError';
import { ApiController } from '~core/store/ApiController';
import { StreamConnection } from '~lib/network';
import { DefaultQueryProvider } from '../common/DefaultQueryProvider';



type ControllerParams = Record<string, string[]>;

export type DatasetStatus = 
 | 'loading' 
 | 'loaded' 
 | 'error';


export type DatasetMetadata = {
    status: DatasetStatus;
    controllerParams: ControllerParams;
}

export type ApplicationStore = {
    controller: ApiController;

    generalSettings: AppGeneralSettings;
    isInitialized: boolean;
    reload: () => Promise<void>;
    initialize: (connection: StreamConnection) => void;

    initializeDataset: (instanceRef: InstanceRef) => Promise<void>;
    initializeDatasets: () => Promise<void>;

    datasets: Record<string, DatasetMetadata>;
    setDatasetMetadata: (instanceId: string, metadata: DatasetMetadata) => void;

    providers: Record<string, DefaultQueryProvider>;
    supportedPlugins: SerializableAdapter[];
    initializedInstances: PluginInstance[];
    setSupportedPlugins: (plugins: SerializableAdapter[]) => void;
    setInitializedInstances: (instances: PluginInstance[]) => void;
}

export const appStore = createStore<ApplicationStore>((set, get) => ({
    controller: null as unknown as ApiController,

    datasets: {},

    generalSettings: null as unknown as AppGeneralSettings,
    isInitialized: false,
    reload: async () => {
        const controller = get().controller;
        await controller.reload();
        // Reset the store state
        set({ providers: {}, supportedPlugins: [], initializedInstances: [], datasets: {} });
        const generalSettings = await controller.getGeneralSettings();
        set({ generalSettings });

        console.log('Controller initialized successfully.');
        const supportedPlugins = await controller.listPlugins();
        set({ supportedPlugins });
        console.log('Supported plugins fetched:', supportedPlugins);
        const initializedInstances = await controller.listInitializedPlugins();
        console.log('Initialized instances fetched:', initializedInstances);
        // Create providers for each initialized instance
        const providers: Record<InstanceRef, DefaultQueryProvider> = {};
        const datasets: Record<InstanceRef, DatasetMetadata> = {};
        initializedInstances.forEach(instance => {
            providers[instance.name] = controller.createProvider(instance);
            datasets[instance.name] = { status: 'loading', controllerParams: {} }; // Set initial status to loading
        });
        set({ providers, datasets });
        console.log('Providers created for initialized instances:', providers);
        get().setInitializedInstances(initializedInstances);
        get().initializeDatasets(); // dont await this, it shouldn't block the initialization
    },
    initializeDataset: async (instanceId: string) => {
        const provider = get().providers[instanceId];
        if (!provider) {
            console.warn(`No provider found for instance ${instanceId}. Skipping dataset initialization.`);
            return;
        }
        const metadata: DatasetMetadata = {
            status: 'loading',
            controllerParams: {},
        };
        get().setDatasetMetadata(instanceId, metadata);
        try {
            await provider.waitForReady();
            const params = await provider.getControllerParams();
            metadata.status = 'loaded';
            metadata.controllerParams = params;
            get().setDatasetMetadata(instanceId, metadata);
            console.log(`Dataset initialized for instance ${instanceId}:`, metadata);
        } catch (error) {
            metadata.status = 'error';
            console.error(`Error initializing dataset for instance ${instanceId}:`, error);
            if (error instanceof Error) {
                notifyError(`Failed to initialize dataset for instance ${instanceId}: ${error.message}`, error);
            }
            get().setDatasetMetadata(instanceId, metadata);
        }
    },
    initializeDatasets: async () => {
        const initializedInstances = get().initializedInstances;
        if (initializedInstances.length === 0) {
            console.warn('No initialized instances found. Skipping dataset initialization.');
            return;
        }
        for (const instance of initializedInstances) {
            await get().initializeDataset(instance.name);
        }
        console.log('All datasets initialized successfully.');
    },
    initialize: async (connection: StreamConnection) => {
        const controller = new ApiController(connection);
        set({ isInitialized: false, controller });
        try {
            await controller.resetQueries();
            await get().reload();
        } catch (error) {
            console.error('Error initializing controller:', error);
            if (error instanceof Error) {
                notifyError(`Failed to initialize controller: ${error.message}`, error);
            }
            throw error; // Re-throw the error to handle it in the calling code
        } finally {
            set({ isInitialized: true });
        }
    },

    setDatasetMetadata: (instanceId: string, metadata: DatasetMetadata) => {
        const currentDatasets = get().datasets;
        currentDatasets[instanceId] = {...metadata};
        set({ datasets: currentDatasets });
        console.log(`Dataset metadata updated for instance ${instanceId}:`, metadata);
    },

    providers: {},

    supportedPlugins: [],
    setSupportedPlugins: (plugins: SerializableAdapter[]) => set({ supportedPlugins: plugins }),

    initializedInstances: [],
    setInitializedInstances: (instances: PluginInstance[]) => set({ initializedInstances: instances }),
}));

export const useApplicationStore = <T>(selector: (state: ApplicationStore) => T): T => {
    return useStore(appStore, selector);
};

export const useGeneralSettings = () => {
    return useApplicationStore((state) => state.generalSettings);
}
