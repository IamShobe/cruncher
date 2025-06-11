import { ControllerIndexParam, Search } from "~lib/qql/grammar";
import { ProcessedData } from "~lib/adapters/logTypes";

export type QueryOptions = {
    fromTime: Date,
    toTime: Date,
    cancelToken: AbortSignal
    limit: number,
    onBatchDone: (data: ProcessedData[]) => void
}

export interface QueryProvider {
    waitForReady(): Promise<void>;
    getControllerParams(): Promise<Record<string, string[]>>;
    query(params: ControllerIndexParam[], searchTerm: Search, queryOptions: QueryOptions): Promise<void>;
}