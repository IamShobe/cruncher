import { Events, Table } from "~core/common/displayTypes";
import { ProcessedData } from "~core/common/logTypes";
import { PipelineItem } from "~core/qql";

export type WorkerMessageResponse = {
    id: string;
} & {
    type: "runPipeline";
    data: [Events, Table | undefined];
};

export type WorkerMessageRequest = {
    id: string;
} & {
    type: "runPipeline";
    data: {
        data: ProcessedData[];
        pipeline: PipelineItem[];
    };
};

