import { bisectCenter } from "d3-array";
import { ScaleLinear, scaleLinear } from "d3-scale";
import { asDateField, ProcessedData } from "@cruncher/adapter-utils/logTypes";

export const getScale = (selectedStartTime: Date, selectedEndTime: Date) => {
  if (!selectedStartTime || !selectedEndTime) {
    return;
  }

  return scaleLinear().domain([
    selectedStartTime.getTime(),
    selectedEndTime.getTime(),
  ]);
};

// Incremental: add new events to existing counts in-place — O(batch × log 100)
export const updateBuckets = (
  counts: Record<number, number>,
  ticks: number[],
  newEvents: ProcessedData[],
): void => {
  for (const event of newEvents) {
    const ts = asDateField(event.object._time).value;
    const tick = ticks[bisectCenter(ticks, ts)]!;
    counts[tick] = (counts[tick] ?? 0) + 1;
  }
};

export const calculateBuckets = (
  scale: ScaleLinear<number, number, unknown> | undefined,
  data: ProcessedData[],
): { timestamp: number; count: number }[] => {
  if (!scale) {
    return [];
  }

  const ticks = scale.ticks(100);
  const counts: Record<number, number> = {};
  updateBuckets(counts, ticks, data);

  return Object.entries(counts).map(([timestamp, count]) => ({
    timestamp: parseInt(timestamp),
    count,
  }));
};
