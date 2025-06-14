import { Mutex } from "async-mutex";
import equal from "fast-deep-equal";
import { atom, createStore, useAtom, useAtomValue } from "jotai";
import { loadable } from "jotai/utils";
import merge from "merge-k-sorted-arrays";
import React, { useEffect } from "react";
import z from "zod";
import { dateAsString, DateType, FullDate, isTimeNow } from "~lib/dateUtils";
import { SubscribeOptions } from "~lib/network";
import { getPipelineItems } from "~lib/pipelineEngine/root";
import { parse, PipelineItem } from "~lib/qql";
import { ControllerIndexParam, Search } from "~lib/qql/grammar";
import { asDateField, compareProcessedData, ProcessedData } from "../../lib/adapters/logTypes";
import { DEFAULT_QUERY_PROVIDER } from "./DefaultQueryProvider";
import { openIndexesAtom } from "./events/state";
import { notifyError, notifySuccess } from "./notifyError";
import { actualEndTimeAtom, actualStartTimeAtom, compareFullDates, endFullDateAtom, startFullDateAtom } from "./store/dateState";
import { dataViewModelAtom, indexAtom, originalDataAtom, searchQueryAtom, tabNameAtom, useQuerySpecificStoreInternal, viewSelectedForQueryAtom } from "./store/queryState";
import { ApplicationStore, appStore, useApplicationStore } from "./store/appStore";
import { atomWithStore } from 'jotai-zustand'

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
    const selectedProfile = get(selectedInstanceAtom);
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

const initializedInstancesSelector = (state: ApplicationStore) => state.initializedInstances;
const providersSelector = (state: ApplicationStore) => state.providers;
const supportedPluginsSelector = (state: ApplicationStore) => state.supportedPlugins;

export const useInitializedInstances = () => {
    return useApplicationStore(initializedInstancesSelector);
}

export const useAvailablePlugins = () => {
    return useApplicationStore(supportedPluginsSelector);
}

export const selectedInstanceIndexAtom = atom<number>(0);

export const useSelectedInstance = () => {
    const selectedIndex = useAtomValue(selectedInstanceIndexAtom);
    const initializedInstances = useApplicationStore((state) => state.initializedInstances);
    return initializedInstances[selectedIndex];
}

export const appStoreAtom = atomWithStore(appStore);

export const selectedInstanceAtom = atom((get) => {
    const initializedInstances = initializedInstancesSelector(get(appStoreAtom));
    const selectedInstanceIndex = get(selectedInstanceIndexAtom);
    if (selectedInstanceIndex === -1 || selectedInstanceIndex >= initializedInstances.length) {
        return undefined;
    }

    return initializedInstances[selectedInstanceIndex];
})


const controllerParamsAtom = atom(async (get) => {
    const initializedInstances = initializedInstancesSelector(get(appStoreAtom));
    const selectedInstanceIndex = get(selectedInstanceIndexAtom);
    if (selectedInstanceIndex === -1 || selectedInstanceIndex >= initializedInstances.length) {
        return {};
    }

    const selectedInstance = initializedInstances[selectedInstanceIndex];
    return get(appStoreAtom).datasets[selectedInstance.id]?.controllerParams ?? {};
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

export const useInitializedController = () => {
    const controller = useApplicationStore((state) => state.controller);
    const isInitialized = useApplicationStore((state) => state.isInitialized);
    if (!isInitialized) {
        throw new Error("Controller is not initialized yet. Please wait for the application to load.");
    }

    return controller;
}

export const providerAtom = atom((get) => {
    const selectedInstance = get(selectedInstanceAtom);
    if (!selectedInstance) {
        return DEFAULT_QUERY_PROVIDER;
    }
    const providers = providersSelector(get(appStoreAtom));
    if (!providers[selectedInstance.id]) {
        console.warn(`No provider found for instance with id ${selectedInstance.id}. Using default provider.`);
        return DEFAULT_QUERY_PROVIDER;
    }

    return providers[selectedInstance.id];
});

export const useQueryProvider = () => {
    return useAtomValue(providerAtom);
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
    const provider = store.get(providerAtom);
    const resetBeforeNewBackendQuery = () => {
        const tree = store.get(indexAtom);
        store.set(openIndexesAtom, []);
        tree.clear();
        store.set(viewSelectedForQueryAtom, false);
    }

    const startProcessingData = (
        data: ProcessedData[],
        pipeline: PipelineItem[],
        startTime: Date,
        endTime: Date
    ) => {
        try {
            const finalData = getPipelineItems(data, pipeline, startTime, endTime);
            store.set(dataViewModelAtom, finalData);
        } catch (error) {
            // check error is of type Error
            if (!(error instanceof Error)) {
                throw error;
            }

            notifyError("Error processing pipeline", error);
        }
    };

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
        const selectedProfile = store.get(selectedInstanceAtom);
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

                const lastExecutedQuery = store.get(lastQueryAtom);
                if (!isForced && compareExecutions(executionQuery, lastExecutedQuery)) {
                    console.log("using cached data");
                    const originalData = store.get(originalDataAtom);
                    startProcessingData(originalData, parsedTree.pipeline, fromTime, toTime);
                    notifySuccess("Pipeline re-evaluated successfully");
                } else {
                    // new search initiated - we can reset
                    resetBeforeNewBackendQuery();
                    try {
                        store.set(lastQueryAtom, executionQuery);
                        let newData: ProcessedData[] = [];
                        await provider.query(parsedTree.controllerParams, parsedTree.search, {
                            fromTime: fromTime,
                            toTime: toTime,
                            cancelToken: cancelToken,
                            limit: 100000,
                            onBatchDone: (data) => {
                                // get current data and merge it with the existing data - memory leak risk!!
                                newData = merge<ProcessedData>(
                                    [newData, data],
                                    compareProcessedData,
                                );
                                const tree = store.get(indexAtom);
                                data.forEach((data) => {
                                    const timestamp = asDateField(data.object._time).value;
                                    const toAppendTo = tree.get(timestamp) ?? [];
                                    toAppendTo.push(data);
                                    tree.set(timestamp, toAppendTo);
                                });

                                store.set(originalDataAtom, newData);
                                startProcessingData(newData, parsedTree.pipeline, fromTime, toTime);
                            },
                        });

                        store.set(isQuerySuccessAtom, true);
                        notifySuccess("Query executed successfully");
                    } catch (error) {
                        store.set(isQuerySuccessAtom, false);
                        console.log(error);
                        if (cancelToken.aborted) {
                            return; // don't continue if the request was aborted
                        }

                        console.error("Error executing query: ", error);
                        throw error;
                    }
                }
            } finally {
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


const compareExecutions = (
    exec1: QueryExecutionHistory,
    exec2: QueryExecutionHistory | undefined
) => {
    if (exec2 === undefined) {
        return false;
    }

    if (!equal(exec1.params, exec2.params)) {
        return false;
    }

    if (!equal(exec1.search, exec2.search)) {
        return false;
    }

    if (compareFullDates(exec1.start, exec2.start) !== 0) {
        return false;
    }

    if (compareFullDates(exec1.end, exec2.end) !== 0) {
        return false;
    }

    return true;
};
