import { InstanceRef, PluginInstance, SearchProfile, SearchProfileRef, SerializableAdapter } from 'src/engineV2/types';
import { AppGeneralSettings } from 'src/plugins_engine/config';
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import { ApiController } from '~core/ApiController';
import { notifyError } from '~core/notifyError';


type ControllerParams = Record<string, string[]>;

export type DatasetStatus =
    | 'uninitialized'
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
    initialize: (controller: ApiController) => void;

    initializeDataset: (instanceRef: InstanceRef) => Promise<void>;
    initializeProfileDatasets: (searchProfileRef: SearchProfileRef) => Promise<void>;

    datasets: Record<string, DatasetMetadata>;
    setDatasetMetadata: (instanceId: string, metadata: DatasetMetadata) => void;

    supportedPlugins: SerializableAdapter[];
    initializedInstances: PluginInstance[];
    searchProfiles: SearchProfile[];
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
        set({ supportedPlugins: [], initializedInstances: [], datasets: {} });
        const generalSettings = await controller.getGeneralSettings();
        set({ generalSettings });

        console.log('Controller initialized successfully.');
        const supportedPlugins = await controller.listPlugins();
        set({ supportedPlugins });
        console.log('Supported plugins fetched:', supportedPlugins);
        const initializedInstances = await controller.listInitializedPlugins();
        console.log('Initialized instances fetched:', initializedInstances);
        const searchProfiles = await controller.listInitializedSearchProfiles();
        console.log('Search profiles fetched:', searchProfiles);
        set({ searchProfiles });
        // Create providers for each initialized instance
        const datasets: Record<InstanceRef, DatasetMetadata> = {};
        initializedInstances.forEach(instance => {
            datasets[instance.name] = { status: 'uninitialized', controllerParams: {} }; // Set initial status to uninitialized
        });
        set({ datasets, initializedInstances });
        if (searchProfiles.find(profile => profile.name === 'default')) {
            console.log('Default search profile found!');
            get().initializeProfileDatasets('default' as SearchProfileRef); // Initialize datasets for the default search profile
        }
    },
    initializeDataset: async (instanceId: InstanceRef) => {
        const { controller } = get();

        const metadata: DatasetMetadata = {
            status: 'loading',
            controllerParams: {},
        };
        get().setDatasetMetadata(instanceId, metadata);
        try {
            const params = await controller.getControllerParams(instanceId);
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
    initializeProfileDatasets: async (searchProfileRef: SearchProfileRef) => {
        const { searchProfiles, initializeDataset } = get();
        const searchProfile = searchProfiles.find(profile => profile.name === searchProfileRef);
        if (!searchProfile) {
            throw new Error(`Search profile ${searchProfileRef} not found.`);
        }

        searchProfile.instances.forEach(instance => {
            initializeDataset(instance);
        });

        console.log('All datasets initialized successfully.');
    },
    initialize: async (controller: ApiController) => {
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
        currentDatasets[instanceId] = { ...metadata };
        set({ datasets: currentDatasets });
        console.log(`Dataset metadata updated for instance ${instanceId}:`, metadata);
    },

    providers: {},

    supportedPlugins: [],
    initializedInstances: [],
    searchProfiles: [],
}));

export const useApplicationStore = <T>(selector: (state: ApplicationStore) => T): T => {
    return useStore(appStore, selector);
};

export const useGeneralSettings = () => {
    return useApplicationStore((state) => state.generalSettings);
}
