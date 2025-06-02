import { ControllerIndexParam, Search } from "~lib/qql/grammar";
import { ProcessedData } from "./logTypes";

export type QueryOptions = {
    fromTime: Date,
    toTime: Date,
    limit: number,
    cancelToken: AbortSignal
    onBatchDone: (data: ProcessedData[]) => void
}

export interface QueryProvider {
    getControllerParams(): Promise<Record<string, string[]>>;
    query(params: ControllerIndexParam[], searchTerm: Search, queryOptions: QueryOptions): Promise<void>;
}

type ObjectParam = {
    type: "object";
    defaultValue?: object;
}
type ArrayParam = {
    type: "array";
    defaultValue?: unknown[];
}
type StringParam = {
    type: "string";
    defaultValue?: string;
}
type NumberParam = {
    type: "number";
    defaultValue?: number;
}
type BooleanParam = {
    type: "boolean";
    defaultValue?: boolean;
}
type DateParam = {
    type: "date";
    defaultValue?: Date;
}

export type Param = {
    name: string;
    description: string;
} & (
    | ObjectParam
    | ArrayParam
    | StringParam
    | NumberParam
    | BooleanParam
    | DateParam
)

export type FactoryParams = {
    params: Record<string, unknown>;
}

export interface Adapter {
    name: string;
    ref: string;
    description: string;
    version: string;

    params: Param[];
    factory: (params: FactoryParams) => QueryProvider;
}