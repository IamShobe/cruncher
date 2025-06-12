import { Mutex } from "async-mutex";
import equal from "fast-deep-equal";
import { atom, createStore, useAtom, useAtomValue } from "jotai";
import merge from "merge-k-sorted-arrays";
import React, { useEffect } from "react";
import z from "zod";
import { dateAsString, DateType, FullDate, isTimeNow } from "~lib/dateUtils";
import { SubscribeOptions } from "~lib/network";
import { getPipelineItems } from "~lib/pipelineEngine/root";
import { parse, PipelineItem } from "~lib/qql";
import { ControllerIndexParam, Search } from "~lib/qql/grammar";
import { asDateField, compareProcessedData, ProcessedData } from "../../lib/adapters/logTypes";
import { QueryProvider } from "./common/interface";
import { DEFAULT_QUERY_PROVIDER } from "./DefaultQueryProvider";
import { openIndexesAtom } from "./events/state";
import { notifyError, notifySuccess } from "./notifyError";
import { actualEndTimeAtom, actualStartTimeAtom, compareFullDates, endFullDateAtom, startFullDateAtom } from "./store/dateState";
import { dataViewModelAtom, indexAtom, originalDataAtom, searchQueryAtom, useQuerySpecificStoreInternal, viewSelectedForQueryAtom } from "./store/queryState";
import { QueryState, useApplicationStore } from "./store/store";

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

export const lastQueryAtom = atom<QueryExecutionHistory | undefined>(undefined);

export const lastExecutedQueryStateAtom = atom<QueryState | undefined>(undefined);

export const isLoadingAtom = atom(false);

export const queryStartTimeAtom = atom<Date | undefined>(undefined);
export const queryEndTimeAtom = atom<Date | undefined>(undefined);
export const isQuerySuccessAtom = atom(true);

export const useInitializedController = () => {
    const controller =  useApplicationStore((state) => state.controller);
    const isInitialized = useApplicationStore((state) => state.isInitialized);
    if (!isInitialized) {
        throw new Error("Controller is not initialized yet. Please wait for the application to load.");
    }

    return controller;
}

export const useSelectedInstance = () => {
    return useApplicationStore((state) => {
        const instanceId = state.selectedInstanceId;
        if (!instanceId) {
            return undefined;
        }

        return state.initializedInstances.find((instance) => instance.id === instanceId);
    })
}

export const useQueryProvider = () => {
    // Use the selectedInstanceId from the application store
    const selectedInstance = useSelectedInstance();
    if (!selectedInstance) {
        return DEFAULT_QUERY_PROVIDER;
    }

    const providers = useApplicationStore((state) => state.providers);
    if (!providers[selectedInstance.id]) {
        console.warn(`No provider found for instance with id ${selectedInstance.id}. Using default provider.`);
        return DEFAULT_QUERY_PROVIDER;
    }

    return providers[selectedInstance.id];
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
    const [searchQuery] = useAtom(searchQueryAtom);
    const [startTime] = useAtom(startFullDateAtom);
    const [endTime] = useAtom(endFullDateAtom);
    return getShareLink({
        searchQuery,
        startTime,
        endTime,
    });
}


export const getShareLink = (queryState: QueryState) => {
    const startTime = queryState.startTime;
    const endTime = queryState.endTime;
    const searchTerm = queryState.searchQuery;

    const queryParams = [];
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
    const controller = useQueryProvider();
    const store = useQuerySpecificStoreInternal();

    return React.useCallback((isForced: boolean) => {
        return runQueryForStore(controller, store, isForced);
    }, [controller, store]);
}

export const runQueryForStore = async (controller: QueryProvider, store: ReturnType<typeof createStore>, isForced: boolean) => {
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
                        await controller.query(parsedTree.controllerParams, parsedTree.search, {
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
