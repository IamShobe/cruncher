import { ProcessedData } from "~lib/adapters/logTypes";

export type Events = {
    type: "events",
    data: ProcessedData[],
}

export type Table = {
    type: "table",
    columns: string[],
    dataPoints: ProcessedData[],
}

export type Bucket = {
    name: string,
    color: string,
}

export type View = {
    type: "view",
    data: ProcessedData[],
    XAxis: string,
    YAxis: Bucket[],
    allBuckets: (string | number)[],
}

export type DataFormatType =
    | Events
    | Table


export type DisplayResults = {
    events: Events;
    table: Table | undefined;
    view: View | undefined;
}