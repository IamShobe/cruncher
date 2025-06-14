import { produce } from "immer";
import { DisplayResults, Events } from "~lib/displayTypes";
import { ProcessedData } from "~lib/adapters/logTypes";
import { NarrowedPipelineItem, PipelineItem, PipelineItemType } from "~lib/qql";
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
        const result = produce(allData, (draft) => {
            const res = processPipeline(draft, pipeline, 0, startTime, endTime);
            draft.events = res.events;
            draft.table = res.table;
            draft.view = res.view;
        });

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
            currentData = processTable(currentData, currentPipeline.columns);
            break;
        case "stats":
            currentData = processStats(currentData, currentPipeline.columns, currentPipeline.groupBy);
            break;
        case "regex":
            currentData = processRegex(currentData, new RegExp(currentPipeline.pattern), currentPipeline.columnSelected);
            break;
        case "sort":
            currentData = processSort(currentData, currentPipeline.columns);
            break;
        case "where":
            currentData = processWhere(currentData, currentPipeline.expression)
            break;
        case "timechart":
            currentData = processTimeChart(currentData, currentPipeline.columns, currentPipeline.groupBy, startTime, endTime, currentPipeline.params);
            break;
        case "eval":
            currentData = processEval(currentData, currentPipeline.variableName, currentPipeline.expression);
            break;
        default:
            // @ts-expect-error - this should never happen
            throw new Error(`Pipeline type '${currentPipeline.type}' not implemented`);
    }

    return processPipeline(currentData, pipeline, currentIndex + 1, startTime, endTime);
}

export type PipelineContext = {
    startTime: Date;
    endTime: Date;
}

export type PipelineItemProcessor = {
    [key in PipelineItemType]: (context: PipelineContext, currentData: DisplayResults, options: NarrowedPipelineItem<key>) => DisplayResults;
}


export const processPipelineV2 = (processor: PipelineItemProcessor, currentData: DisplayResults, pipeline: PipelineItem[], context: PipelineContext) => {
    const innerProcessPipeline = (currentData: DisplayResults, currentIndex: number): DisplayResults => {
        if (currentIndex >= pipeline.length) {
            return currentData;
        }

        const currentPipeline = pipeline[currentIndex];
        if (!currentPipeline) {
            throw new Error(`Pipeline item at index ${currentIndex} is undefined`);
        }

        const processedData = processPipelineType(processor, context, currentData, currentPipeline);

        return innerProcessPipeline(processedData, currentIndex + 1);
    }

    return innerProcessPipeline(currentData, 0);
}

const processPipelineType = <T extends PipelineItemType>(processor: PipelineItemProcessor, context: PipelineContext, currentData: DisplayResults, params: NarrowedPipelineItem<T>) => {
    const processorFn = processor[params.type];
    if (!processorFn) {
        throw new Error(`Processor for pipeline item type '${params.type}' not found`);
    }

    return processorFn(context, currentData, params);
}
