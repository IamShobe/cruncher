
import { ProcessedData } from "~core/common/logTypes";
import { getPipelineItems as getPipelineItemsSync } from "~core/pipelineEngine/root";
import { PipelineItem } from "~core/qql";
import { WorkerMessageRequest, WorkerMessageResponse } from "./types";

const getPipelineItems = (data: ProcessedData[], pipeline: PipelineItem[]) => {
    return getPipelineItemsSync(data, pipeline);
};

self.onmessage = (event: MessageEvent<WorkerMessageRequest>) => {
    const parsedEvent = event.data;
    console.log("Worker received message", parsedEvent);

    switch (parsedEvent.type) {
        case "runPipeline":
            const result = getPipelineItems(parsedEvent.data.data, parsedEvent.data.pipeline);
            const transferable = { id: parsedEvent.id, type: "runPipeline", data: result } satisfies WorkerMessageResponse;

            self.postMessage(transferable);
            break;

        default:
            console.error("Unknown message type", parsedEvent);
    }
}
