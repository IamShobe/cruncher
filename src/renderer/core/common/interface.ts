import { JobBatchFinished, QueryTask } from "src/engineV2/types";

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
