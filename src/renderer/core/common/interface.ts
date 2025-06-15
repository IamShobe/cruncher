import { ClosestPoint, JobBatchFinished, PageResponse, QueryTask, TaskRef } from "src/engineV2/engine";
import { ProcessedData } from "~lib/adapters/logTypes";
import { DisplayResults } from "~lib/displayTypes";

export type QueryOptions = {
    fromTime: Date,
    toTime: Date,
    cancelToken: AbortSignal
    limit: number,
    isForced: boolean,
    onBatchDone: (data: JobBatchFinished) => void
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
    getLogsPaginated(taskId: TaskRef, offset: number, limit: number): Promise<PageResponse<ProcessedData>>;
    getClosestDateEvent(taskId: TaskRef, refDate: number): Promise<ClosestPoint | null>;
    releaseResources(taskId: TaskRef): Promise<void>;
}