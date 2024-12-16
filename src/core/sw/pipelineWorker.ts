/// <reference lib="webworker" />

import { ProcessedData } from "~core/common/logTypes";
import { getPipelineItems as getPipelineItemsSync } from "~core/pipelineEngine/root";
import { PipelineItem } from "~core/qql";

declare const self: DedicatedWorkerGlobalScope;


export const getPipelineItems = (data: ProcessedData[], pipeline: PipelineItem[]) => {
    return getPipelineItemsSync(data, pipeline);
};
