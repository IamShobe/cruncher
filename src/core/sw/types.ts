import { DisplayResults } from "~core/common/displayTypes";
import { ProcessedData } from "~core/common/logTypes";
import { PipelineItem } from "~core/qql";

export type WorkerMessageResponse = {
    id: string;
} & {
    type: "runPipeline";
    data: DisplayResults;
};

export type WorkerMessageRequest = {
    id: string;
} & {
    type: "runPipeline";
    data: {
        data: ProcessedData[];
        pipeline: PipelineItem[];
        timeStart: number;
        timeEnd: number;
    };
};
