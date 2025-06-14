import { QueryTask, TaskRef } from "src/engineV2/engine";
import { DisplayResults } from "~lib/displayTypes";

export type QueryOptions = {
    fromTime: Date,
    toTime: Date,
    cancelToken: AbortSignal
    limit: number,
    isForced: boolean,
    onBatchDone: (data: DisplayResults) => void
}

export type AwaitableTask = {
    job: QueryTask;
    promise: Promise<void>;
}

export interface QueryProvider {
    waitForReady(): Promise<void>;
    getControllerParams(): Promise<Record<string, string[]>>;
    query(searchTerm: string, queryOptions: QueryOptions): Promise<AwaitableTask>;
    getLogs(): Promise<DisplayResults>;
    getClosestDateEvent(taskId: TaskRef, refDate: number): Promise<number | null>;
    releaseResources(taskId: TaskRef): Promise<void>;
}