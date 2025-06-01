import { atom } from "jotai";
import { ControllerIndexParam, Search } from "~lib/qql/grammar";
import { actualEndTimeAtom, actualStartTimeAtom, compareFullDates, FullDate, isTimeNow } from "./store/dateState";
import { store } from "./store/store";
import { parse, PipelineItem } from "~lib/qql";
import { asDateField, compareProcessedData, ProcessedData } from "../../lib/adapters/logTypes";
import equal from "fast-deep-equal";
import { availableControllerParamsAtom, dataViewModelAtom, originalDataAtom, viewSelectedForQueryAtom } from "./store/queryState";
import { notifyError } from "./notifyError";
import { getPipelineItems } from "~lib/pipelineEngine/root";
import { tree } from "./indexes/timeIndex";
import { QueryProvider } from "./common/interface";
import merge from "merge-k-sorted-arrays";
import { Mutex } from "async-mutex";
import { openIndexesAtom } from "./events/state";

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
export const isLoadingAtom = atom(false);

export const queryStartTimeAtom = atom<Date | undefined>(undefined);
export const queryEndTimeAtom = atom<Date | undefined>(undefined);
export const isQuerySuccessAtom = atom(true);

export const setup = async (controller: QueryProvider) => {
    // this can be done async to the loading of the app - no need to block
    controller.getControllerParams().then((params) => {
        store.set(availableControllerParamsAtom, params);
    });
}

export const abortRunningQuery = (reason: string) => {
    const abortController = store.get(abortControllerAtom);
    abortController.abort(reason);
}

export const runQuery = async (controller: QueryProvider, values: FormValues, isForced: boolean) => {
    const abortController = store.get(abortControllerAtom);
    const isLoading = store.get(isLoadingAtom);
    if (isLoading) {
        abortController.abort("New query submitted");
    }

    // reset abort controller
    const newAbortController = new AbortController();
    store.set(abortControllerAtom, newAbortController);

    const submitMutex = store.get(submitMutexAtom);
    await submitMutex.runExclusive(async () => {
        await doRunQuery(controller, values, isForced);
    });
}

const doRunQuery = async (controller: QueryProvider, values: FormValues, isForced: boolean) => {
    if (values.fromTime === undefined) {
        // TODO: return error
        return;
    }

    if (values.toTime === undefined) {
        // TODO: return error
        return;
    }

    const fromTime = isTimeNow(values.fromTime) ? new Date() : values.fromTime;
    const toTime = isTimeNow(values.toTime) ? new Date() : values.toTime;

    if (fromTime.getTime() > toTime.getTime()) {
        // TODO: return error
        return;
    }

    store.set(actualStartTimeAtom, fromTime);
    store.set(actualEndTimeAtom, toTime);

    const abortController = store.get(abortControllerAtom);
    const lastExecutedQuery = store.get(lastQueryAtom);

    try {
        const parsedTree = parse(values.searchTerm);
        let dataForPipelines: ProcessedData[] = [];
        const cancelToken = abortController.signal;
        try {
            store.set(isLoadingAtom, true);
            store.set(queryStartTimeAtom, new Date());
            store.set(queryEndTimeAtom, undefined);

            const executionQuery = {
                search: parsedTree.search,
                start: fromTime,
                end: toTime,
                params: parsedTree.controllerParams,
            };

            if (!isForced && compareExecutions(executionQuery, lastExecutedQuery)) {
                console.log("using cached data");
                dataForPipelines = store.get(originalDataAtom); // get the data from the last query
                startProcessingData(dataForPipelines, parsedTree.pipeline, fromTime, toTime);
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
                            dataForPipelines = merge<ProcessedData>(
                                [dataForPipelines, data],
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
};

const resetBeforeNewBackendQuery = () => {
    store.set(openIndexesAtom, []);
    tree.clear();
    store.set(viewSelectedForQueryAtom, false);
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