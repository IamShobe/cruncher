import { Mutex } from "async-mutex";
import { atom, createStore, useAtom, useAtomValue } from "jotai";
import { atomWithStore } from 'jotai-zustand';
import { loadable } from "jotai/utils";
import React, { useEffect } from "react";
import { QueryTask } from "src/engineV2/types";
import z from "zod";
import { dateAsString, DateType, FullDate, isTimeNow } from "~lib/dateUtils";
import { SubscribeOptions } from "~lib/network";
import { parse } from "~lib/qql";
import { ControllerIndexParam, Search } from "~lib/qql/grammar";
import { invalidateJobQueries } from "./api";
import { AwaitableTask } from "./common/interface";
import { openIndexesAtom } from "./events/state";
import { notifyError, notifySuccess } from "./notifyError";
import { ApplicationStore, appStore, useApplicationStore } from "./store/appStore";
import { actualEndTimeAtom, actualStartTimeAtom, endFullDateAtom, startFullDateAtom } from "./store/dateState";
import { jobMetadataAtom, searchQueryAtom, tabNameAtom, useQuerySpecificStoreInternal, viewSelectedForQueryAtom } from "./store/queryState";

export type QueryState = {
    searchQuery: string;
    startTime: FullDate | undefined;
    endTime: FullDate | undefined;

    selectedProfile: string | undefined;
    tabName: string | undefined; // Optional tab name for the query
}

export const queryStateAtom = atom<QueryState>((get) => {
    const searchQuery = get(searchQueryAtom);
    const startTime = get(startFullDateAtom);
    const endTime = get(endFullDateAtom);
    const selectedProfile = get(selectedSearchProfileAtom);
    const tabName = get(tabNameAtom);

    return {
        searchQuery,
        startTime,
        endTime,
        selectedProfile: selectedProfile ? selectedProfile.name : undefined,
        tabName,
    };
});

export type FormValues = {
    searchTerm: string;
    fromTime: FullDate | undefined;
    toTime: FullDate | undefined;
};

export type QueryExecutionHistory = {
    params: ControllerIndexParam[];
    search: Search;
    start: FullDate;
    end: FullDate;
};

const submitMutexAtom = atom(new Mutex());
const abortControllerAtom = atom(new AbortController());

export const initializedInstancesSelector = (state: ApplicationStore) => state.initializedInstances;
export const supportedPluginsSelector = (state: ApplicationStore) => state.supportedPlugins;
export const searchProfilesSelector = (state: ApplicationStore) => state.searchProfiles;

export const useInitializedInstances = () => {
    return useApplicationStore(initializedInstancesSelector);
}

export const useAvailablePlugins = () => {
    return useApplicationStore(supportedPluginsSelector);
}

export const selectedSearchProfileIndexAtom = atom<number>(0);

export const useSelectedSearchProfile = () => {
    const selectedIndex = useAtomValue(selectedSearchProfileIndexAtom);
    const searchProfiles = useApplicationStore(searchProfilesSelector);
    return searchProfiles[selectedIndex];
}

export const appStoreAtom = atomWithStore(appStore);

export const selectedSearchProfileAtom = atom((get) => {
    const searchProfiles = searchProfilesSelector(get(appStoreAtom));
    const selectedProfileIndex = get(selectedSearchProfileIndexAtom);
    if (selectedProfileIndex === -1 || selectedProfileIndex >= searchProfiles.length) {
        return undefined;
    }

    return searchProfiles[selectedProfileIndex];
})


const controllerParamsAtom = atom(async (get) => {
    const initializedInstances = initializedInstancesSelector(get(appStoreAtom));
    const selectedInstanceIndex = get(selectedSearchProfileIndexAtom);
    if (selectedInstanceIndex === -1 || selectedInstanceIndex >= initializedInstances.length) {
        return {};
    }

    const selectedInstance = initializedInstances[selectedInstanceIndex];
    return get(appStoreAtom).datasets[selectedInstance.name]?.controllerParams ?? {};
});

export const loadingControllerParamsAtom = loadable(controllerParamsAtom);

export const useControllerParams = () => {
    return useAtomValue(loadingControllerParamsAtom);
}


export const lastQueryAtom = atom<QueryExecutionHistory | undefined>(undefined);

export const lastExecutedQueryStateAtom = atom<QueryState | undefined>(undefined);

export const isLoadingAtom = atom(false);

export const queryStartTimeAtom = atom<Date | undefined>(undefined);
export const queryEndTimeAtom = atom<Date | undefined>(undefined);
export const isQuerySuccessAtom = atom(true);
export const lastRanJobAtom = atom<QueryTask | undefined>(undefined);

export const useInitializedController = () => {
    const controller = useApplicationStore((state) => state.controller);
    const isInitialized = useApplicationStore((state) => state.isInitialized);
    if (!isInitialized) {
        throw new Error("Controller is not initialized yet. Please wait for the application to load.");
    }

    return controller;
}


export const useMessageEvent = <T extends z.ZodTypeAny>(schema: T, options: SubscribeOptions<T>) => {
    const controller = useInitializedController();

    useEffect(() => {
        const unsubscribe = controller.subscribeToMessages(schema, options);
        return () => {
            unsubscribe();
        };
    }, [controller, schema, options]);
}

export const useQueryExecutedEffect = (callback: (state: QueryState) => void) => {
    const lastExecutedQueryState = useAtomValue(lastExecutedQueryStateAtom);
    useEffect(() => {
        callback({
            searchQuery: lastExecutedQueryState?.searchQuery ?? '',
            startTime: lastExecutedQueryState?.startTime,
            endTime: lastExecutedQueryState?.endTime,
            selectedProfile: lastExecutedQueryState?.selectedProfile,
            tabName: lastExecutedQueryState?.tabName,
        });
    }, [lastExecutedQueryState, callback]);
}


export const useQueryActions = () => {
    const [startFullDate, setStartFullDate] = useAtom(startFullDateAtom);
    const [endFullDate, setEndFullDate] = useAtom(endFullDateAtom);
    const currentShareLink = useCurrentShareLink();
    const abortController = useAtomValue(abortControllerAtom);

    return {
        toggleUntilNow: () => {
            if (!startFullDate || startFullDate > new Date()) {
                setStartFullDate(new Date());
            }

            if (endFullDate === DateType.Now) {
                setEndFullDate(new Date());
            } else {
                setEndFullDate(DateType.Now);
            }
        },
        copyCurrentShareLink: () => {
            navigator.clipboard.writeText(currentShareLink).then(() => {
                notifySuccess("Shareable link copied to clipboard");
            }).catch((error) => {
                console.error("Failed to copy shareable link: ", error);
                notifyError("Failed to copy shareable link", error);
            });
        },
        abortRunningQuery: (reason: string) => {
            abortController.abort(reason);
        }
    }
}

export const useCurrentShareLink = () => {
    const queryState = useAtomValue(queryStateAtom);
    return getShareLink(queryState);
}

export const getShareLink = (queryState: QueryState) => {
    const startTime = queryState.startTime;
    const endTime = queryState.endTime;
    const searchTerm = queryState.searchQuery;
    const selectedProfile = queryState.selectedProfile;
    const tabName = queryState.tabName;

    const queryParams = [];
    if (tabName) {
        queryParams.push(`name=${encodeURIComponent(tabName)}`);
    }
    if (selectedProfile) {
        queryParams.push(`profile=${encodeURIComponent(selectedProfile)}`);
    }
    if (startTime) {
        queryParams.push(`startTime=${dateAsString(startTime)}`);
    }
    if (endTime) {
        queryParams.push(`endTime=${dateAsString(endTime)}`);
    }
    if (searchTerm) {
        queryParams.push(`searchQuery=${encodeURIComponent(searchTerm)}`);
    }

    const totalQueryParams = '?' + queryParams.join('&');

    return `cruncher://main${totalQueryParams}`;
}


export const useRunQuery = () => {
    const store = useQuerySpecificStoreInternal();

    return React.useCallback((isForced: boolean) => {
        return runQueryForStore(store, isForced);
    }, [store]);
}

export const runQueryForStore = async (store: ReturnType<typeof createStore>, isForced: boolean) => {
    const controller = store.get(appStoreAtom).controller;
    const resetBeforeNewBackendQuery = () => {
        store.set(openIndexesAtom, []);
        store.set(viewSelectedForQueryAtom, false);
    }

    const isLoading = store.get(isLoadingAtom);
    if (isLoading) {
        store.get(abortControllerAtom).abort("New query submitted");
    }
    // reset abort controller
    const newAbortController = new AbortController();
    store.set(abortControllerAtom, newAbortController);

    const submitMutex = store.get(submitMutexAtom);

    await submitMutex.runExclusive(async () => {
        const startFullDate = store.get(startFullDateAtom);
        const endFullDate = store.get(endFullDateAtom);
        const searchTerm = store.get(searchQueryAtom);
        const selectedProfile = store.get(selectedSearchProfileAtom);
        if (!selectedProfile) {
            // TODO: return error
            return;
        }
        if (startFullDate === undefined) {
            // TODO: return error
            return;
        }

        if (endFullDate === undefined) {
            // TODO: return error
            return;
        }

        const fromTime = isTimeNow(startFullDate) ? new Date() : startFullDate;
        const toTime = isTimeNow(endFullDate) ? new Date() : endFullDate;

        if (fromTime.getTime() > toTime.getTime()) {
            // TODO: return error
            return;
        }

        store.set(actualStartTimeAtom, fromTime);
        store.set(actualEndTimeAtom, toTime);

        const state: QueryState = {
            startTime: startFullDate,
            endTime: endFullDate,
            searchQuery: searchTerm,
            selectedProfile: selectedProfile.name,
            tabName: store.get(tabNameAtom),
        };

        store.set(lastExecutedQueryStateAtom, state);
        let awaitableJob: AwaitableTask | undefined = undefined;
        const storeLastJob = async () => {
            // get old job
            const lastRanJob = store.get(lastRanJobAtom);
            // release the old job
            console.log("Releasing resources for last ran job: ", lastRanJob?.id);
            if (lastRanJob && lastRanJob.id !== awaitableJob?.job.id) {
                await controller.releaseResources(lastRanJob.id);
            }
            store.set(lastRanJobAtom, awaitableJob?.job);
        }

        try {
            const parsedTree = parse(searchTerm);
            const cancelToken = newAbortController.signal;
            try {
                store.set(isLoadingAtom, true);
                store.set(queryStartTimeAtom, new Date());
                store.set(queryEndTimeAtom, undefined);

                const executionQuery: QueryExecutionHistory = {
                    search: parsedTree.search,
                    start: fromTime,
                    end: toTime,
                    params: parsedTree.controllerParams,
                };

                // new search initiated - we can reset
                resetBeforeNewBackendQuery();
                try {
                    store.set(lastQueryAtom, executionQuery);

                    awaitableJob = await controller.query(selectedProfile.name, searchTerm, {
                        fromTime: fromTime,
                        toTime: toTime,
                        cancelToken: cancelToken,
                        limit: 100000,
                        isForced: isForced,
                        onBatchDone: async (data) => {
                            await storeLastJob();
                            await invalidateJobQueries(awaitableJob?.job.id);
                            // store.set(lastUpdateAtom, new Date());
                            store.set(jobMetadataAtom, data);
                            // store.set(dataViewModelAtom, data);
                        },
                    });
                    await awaitableJob.promise;
                    store.set(isQuerySuccessAtom, true);
                    notifySuccess("Query executed successfully");
                } catch (error) {
                    store.set(isQuerySuccessAtom, false);
                    console.log(error);
                    if (cancelToken.aborted) {
                        console.log("Query was aborted");
                        return; // don't continue if the request was aborted
                    }

                    console.error("Error executing query: ", error);
                    throw error;
                }
            } finally {
                await storeLastJob();
                store.set(isLoadingAtom, false);
                store.set(queryEndTimeAtom, new Date());
            }
        } catch (error) {
            if (!(error instanceof Error)) {
                throw error;
            }

            console.error("Error parsing query: ", error);
            notifyError("Error parsing query", error);
        }
    });
}
