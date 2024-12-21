import { produce } from "immer";
import { DisplayResults, Events } from "~core/common/displayTypes";
import { ProcessedData } from "~core/common/logTypes";
import { PipelineItem } from "~core/qql";
import { processEval } from "./eval";
import { processRegex } from "./regex";
import { processSort } from "./sort";
import { processStats } from "./stats";
import { processTable } from "./table";
import { processTimeChart } from "./timechart";
import { processWhere } from "./where";

export const getPipelineItems = (data: ProcessedData[], pipeline: PipelineItem[], startTime: Date, endTime: Date) => {
    const currentData = {
        type: "events",
        data: data,
    } satisfies Events;

    const allData: DisplayResults = {
        events: currentData,
        table: undefined,
        view: undefined,
    };

    const pipelineStart = new Date();
    console.log("[Pipeline] Start time: ", pipelineStart);
    try {
        const result = processPipeline(allData, pipeline, 0, startTime, endTime);
        // const result = produce(allData, (draft) => {
        //     const res = processPipeline(draft, pipeline, 0, startTime, endTime);
        //     draft.events = res.events;
        //     draft.table = res.table;
        //     draft.view = res.view;
        // });
        console.log("[Pipeline] Result: ", result);

        return result;
    } finally {
        const pipelineEnd = new Date();
        console.log("[Pipeline] End time: ", pipelineEnd);
        console.log("[Pipeline] Time taken: ", pipelineEnd.getTime() - pipelineStart.getTime());
    }
}

const processPipeline = (currentData: DisplayResults, pipeline: PipelineItem[], currentIndex: number, startTime: Date, endTime: Date) => {
    if (currentIndex >= pipeline.length) {
        return currentData;
    }

    const currentPipeline = pipeline[currentIndex];

    switch (currentPipeline.type) {
        case "table":
            return processPipeline(processTable(currentData, currentPipeline.columns), pipeline, currentIndex + 1, startTime, endTime);
        case "stats":
            return processPipeline(processStats(currentData, currentPipeline.columns, currentPipeline.groupBy), pipeline, currentIndex + 1, startTime, endTime);
        case "regex":
            return processPipeline(processRegex(currentData, new RegExp(currentPipeline.pattern), currentPipeline.columnSelected), pipeline, currentIndex + 1, startTime, endTime);
        case "sort":
            return processPipeline(processSort(currentData, currentPipeline.columns), pipeline, currentIndex + 1, startTime, endTime);
        case "where":
            return processPipeline(processWhere(currentData, currentPipeline.expression), pipeline, currentIndex + 1, startTime, endTime);
        case "timechart":
            return processPipeline(processTimeChart(currentData, currentPipeline.columns, currentPipeline.groupBy, startTime, endTime, currentPipeline.params), pipeline, currentIndex + 1, startTime, endTime);
        case "eval":
            return processPipeline(processEval(currentData, currentPipeline.variableName, currentPipeline.expression), pipeline, currentIndex + 1, startTime, endTime);
        default:
            // @ts-expect-error - this should never happen
            throw new Error(`Pipeline type '${currentPipeline.type}' not implemented`);
    }
}
