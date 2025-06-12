import { atom } from 'jotai';
import { create } from 'zustand';
import { FullDate } from '~lib/dateUtils';
import { endFullDateAtom, startFullDateAtom } from './dateState';
import { searchQueryAtom } from './queryState';
import { PluginInstance, SupportedPlugin } from 'src/plugins_engine/types';

export type QueryState = {
    searchQuery: string;
    startTime: FullDate | undefined;
    endTime: FullDate | undefined;
}

export const queryStateAtom = atom<QueryState>((get) => {
    const searchQuery = get(searchQueryAtom);
    const startTime = get(startFullDateAtom);
    const endTime = get(endFullDateAtom);

    return {
        searchQuery,
        startTime,
        endTime,
    };
});

export type ApplicationStore = {
    isInitialized: boolean;
    setIsInitialized: (isInitialized: boolean) => void;

    controllerParams: Record<string, string[]>;
    setControllerParams: (params: Record<string, string[]>) => void;

    supportedPlugins: SupportedPlugin[];
    setSupportedPlugins: (plugins: SupportedPlugin[]) => void;

    initializedInstances: PluginInstance[];
    setInitializedInstances: (instances: PluginInstance[]) => void;
}

export const useApplicationStore = create<ApplicationStore>((set) => ({
    isInitialized: false,
    setIsInitialized: (isInitialized: boolean) => set({ isInitialized }),

    controllerParams: {},
    setControllerParams: (params: Record<string, string[]>) => set({ controllerParams: params }),

    supportedPlugins: [],
    setSupportedPlugins: (plugins: SupportedPlugin[]) => set({ supportedPlugins: plugins }),

    initializedInstances: [],
    setInitializedInstances: (instances: PluginInstance[]) => set({ initializedInstances: instances }),
}));
