import { Mutex } from "async-mutex";
import equal from "fast-deep-equal";
import { atom, createStore, useAtom, useAtomValue } from "jotai";
import merge from "merge-k-sorted-arrays";
import React, { useEffect } from "react";
import { useAsync } from "react-use";
import z from "zod";
import { dateAsString, DateType, FullDate, isTimeNow } from "~lib/dateUtils";
import { getPipelineItems } from "~lib/pipelineEngine/root";
import { parse, PipelineItem } from "~lib/qql";
import { ControllerIndexParam, Search } from "~lib/qql/grammar";
import { SubscribeOptions } from "~lib/websocket/client";
import { asDateField, compareProcessedData, ProcessedData } from "../../lib/adapters/logTypes";
import { QueryProvider } from "./common/interface";
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

export type ControllerProviderContextType = {
    provider: QueryProvider | undefined;
    subscribeToMessages: <T extends z.ZodTypeAny>(schema: T, options: SubscribeOptions<T>) => () => void;
}
export const ControllerProviderContext = React.createContext<ControllerProviderContextType | undefined>(undefined);

export const useQueryProvider = () => {
    const context = React.useContext(ControllerProviderContext);
    if (context === undefined) {
        throw new Error("useQueryProvider must be used within a ControllerProvider");
    }
    if (context.provider === undefined) {
        throw new Error("Query provider is not set. Please ensure the provider is initialized.");
    }

    return context.provider;
}

export const useMessageEvent = <T extends z.ZodTypeAny>(schema: T, options: SubscribeOptions<T>) => {
    const context = React.useContext(ControllerProviderContext);
    if (context === undefined) {
        throw new Error("useMessageEvent must be used within a ControllerProvider");
    }
    if (context.subscribeToMessages === undefined) {
        throw new Error("subscribeToMessages is not available in the current context");
    }

    useEffect(() => {
        const unsubscribe = context.subscribeToMessages(schema, options);
        return () => {
            unsubscribe();
        };
    }, [context, schema, options]);
}

export const useController = () => {
    return useQueryProvider();
}

export const useControllerInitializer = () => {
    const controller = useController();
    const setIsInitialized = useApplicationStore((state) => state.setIsInitialized);
    const setControllerParams = useApplicationStore((state) => state.setControllerParams);
    useAsync(async () => {
        console.log("waiting for controller to be ready...");
        await controller.waitForReady?.();
        // const params = await controller.getControllerParams();
        // setControllerParams(params);
        setIsInitialized(true);
    }, [setIsInitialized, setControllerParams, controller]);
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



// export const setup = async () => {
//     const controller = useController();
//     await controller?.waitForReady?.();
//     // this can be done async to the loading of the app - no need to block
//     // TODO: this needs to be smarter
//     controller.getControllerParams().then((params) => {
//         store.set(availableControllerParamsAtom, params);
//     });
// }

export const useRunQuery = () => {
    const controller = useController();
    const store = useQuerySpecificStoreInternal();

    return React.useCallback((isForced: boolean) => {
        return runQueryForStore(controller, store, isForced);
    }, [controller, store]);
}

export const runQueryForStore = async (controller: QueryProvider, store: ReturnType<typeof createStore>, isForced: boolean) => {
    const tree = store.get(indexAtom);
    const resetBeforeNewBackendQuery = () => {
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
                } else {
                    // new search initiated - we can reset
                    resetBeforeNewBackendQuery();
                    try {
                        store.set(lastQueryAtom, executionQuery);
                        await controller.query(parsedTree.controllerParams, parsedTree.search, {
                            fromTime: fromTime,
                            toTime: toTime,
                            cancelToken: cancelToken,
                            limit: 100000,
                            onBatchDone: (data) => {
                                // get current data and merge it with the existing data - memory leak risk!!
                                const existingData = store.get(originalDataAtom);
                                const dataForPipelines = merge<ProcessedData>(
                                    [existingData, data],
                                    compareProcessedData,
                                );
                                data.forEach((data) => {
                                    const timestamp = asDateField(data.object._time).value;
                                    const toAppendTo = tree.get(timestamp) ?? [];
                                    toAppendTo.push(data);
                                    tree.set(timestamp, toAppendTo);
                                });

                                store.set(originalDataAtom, dataForPipelines);
                                startProcessingData(dataForPipelines, parsedTree.pipeline, fromTime, toTime);
                            },
                        });

                        store.set(isQuerySuccessAtom, true);
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
                notifySuccess("Query executed successfully");
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
