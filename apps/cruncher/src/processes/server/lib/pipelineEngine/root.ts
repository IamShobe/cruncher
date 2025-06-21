import { DisplayResults } from "~lib/displayTypes";
import { NarrowedPipelineItem, PipelineItem, PipelineItemType } from "@cruncher/qql";

export type PipelineContext = {
  startTime: Date;
  endTime: Date;
};

export type PipelineItemProcessor = {
  [key in PipelineItemType]: (
    context: PipelineContext,
    currentData: DisplayResults,
    options: NarrowedPipelineItem<key>,
  ) => DisplayResults;
};

export const processPipelineV2 = (
  processor: PipelineItemProcessor,
  currentData: DisplayResults,
  pipeline: PipelineItem[],
  context: PipelineContext,
) => {
  const innerProcessPipeline = (
    currentData: DisplayResults,
    currentIndex: number,
  ): DisplayResults => {
    if (currentIndex >= pipeline.length) {
      return currentData;
    }

    const currentPipeline = pipeline[currentIndex];
    if (!currentPipeline) {
      throw new Error(`Pipeline item at index ${currentIndex} is undefined`);
    }

    const processedData = processPipelineType(
      processor,
      context,
      currentData,
      currentPipeline,
    );

    return innerProcessPipeline(processedData, currentIndex + 1);
  };

  return innerProcessPipeline(currentData, 0);
};

const processPipelineType = <T extends PipelineItemType>(
  processor: PipelineItemProcessor,
  context: PipelineContext,
  currentData: DisplayResults,
  params: NarrowedPipelineItem<T>,
) => {
  const processorFn = processor[params.type];
  if (!processorFn) {
    throw new Error(
      `Processor for pipeline item type '${params.type}' not found`,
    );
  }

  return processorFn(context, currentData, params);
};
