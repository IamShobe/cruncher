import { ProcessedData } from "~core/common/logTypes";
import { getPipelineItems as getPipelineItemsSync } from "~core/pipelineEngine/root";
import { PipelineItem } from "~core/qql";
import { WorkerMessageRequest, WorkerMessageResponse } from "./types";

const getPipelineItems = (data: ProcessedData[], pipeline: PipelineItem[], startTime: Date, endTime: Date) => {
    return getPipelineItemsSync(data, pipeline, startTime, endTime);
};

self.onmessage = (event: MessageEvent<WorkerMessageRequest>) => {
    const parsedEvent = event.data;
    console.log("Worker received message", parsedEvent);

    switch (parsedEvent.type) {
        case "runPipeline":
            const result = getPipelineItems(parsedEvent.data.data, parsedEvent.data.pipeline, new Date(parsedEvent.data.timeStart), new Date(parsedEvent.data.timeEnd));
            const transferable = { id: parsedEvent.id, type: "runPipeline", data: result } satisfies WorkerMessageResponse;

            self.postMessage(transferable);
            break;

        default:
            console.error("Unknown message type", parsedEvent);
    }
}
