import { DisplayResults } from "~lib/displayTypes";
import {
  asDateField,
  HashableField,
  isHashableField,
  ProcessedData,
} from "@cruncher/adapter-utils/logTypes";
import { AggregationFunction } from "@cruncher/qql/grammar";

type TimechartParams = { span?: string; timeCol?: string; maxGroups?: number };
import { bucketData } from "./aggregateData";

function buildAggregatedBuckets(
  dataPoints: ProcessedData[],
  timeCol: string,
  groupByColumns: string[],
  aggregatedColumns: string[],
): { aggregatedBucketData: Map<number, ProcessedData>; yAxis: Set<string> } {
  const yAxis = new Set<string>();
  const aggregatedBucketData = new Map<number, ProcessedData>();

  for (const dataPoint of dataPoints) {
    const time = asDateField(dataPoint.object[timeCol]).value;
    const groupKey = groupByColumns.reduce(
      (acc, col) => acc + (dataPoint.object[col]?.value.toString() ?? ""),
      "",
    );
    for (const col of aggregatedColumns) {
      const value = dataPoint.object[col];
      if (!value || !isHashableField(value)) continue;
      const fullKey = groupKey ? `${groupKey}_${col}` : col;
      yAxis.add(fullKey);
      let existing = aggregatedBucketData.get(time);
      if (!existing) {
        existing = { object: { [timeCol]: dataPoint.object[timeCol] }, message: "" };
        aggregatedBucketData.set(time, existing);
      }
      existing.object[fullKey] = value;
    }
  }

  return { aggregatedBucketData, yAxis };
}

/**
 * Build the chart view from data that has already been bucketed + aggregated
 * (e.g. by DuckDB). Handles only the pivot and YAxis/allBuckets construction.
 */
export const buildChartView = (
  dataPoints: ProcessedData[],
  timeCol: string,
  groupByColumns: string[],
  aggregatedColumns: string[],
  fromTime: Date,
  toTime: Date,
  span: string,
  maxGroups: number,
): NonNullable<DisplayResults["view"]> => {
  const spanMs = parseTimeSpan(span);
  const allBuckets: number[] = [];
  for (let i = fromTime.getTime(); i < toTime.getTime(); i += spanMs) {
    allBuckets.push(i);
  }

  const { aggregatedBucketData, yAxis } = buildAggregatedBuckets(
    dataPoints, timeCol, groupByColumns, aggregatedColumns,
  );

  const buckets = Array.from(yAxis)
    .slice(0, maxGroups === -1 ? undefined : maxGroups)
    .map((name) => ({ name, color: getRandomColor() }));

  return {
    type: "view",
    data: Array.from(aggregatedBucketData.values()),
    XAxis: timeCol,
    YAxis: buckets,
    allBuckets,
  };
};

export const processTimeChart = (
  data: DisplayResults,
  functions: AggregationFunction[],
  groupBy: string[] | undefined,
  fromTime: Date,
  toTime: Date,
  params: TimechartParams,
): DisplayResults => {
  const { events, table } = data;
  const dataPoints = table ? table.dataPoints : events.data;

  const timeCol = params.timeCol ?? "_time";
  const timeBuckets = parseTimeSpan(params.span ?? "5m");
  const maxBuckets = params.maxGroups ?? 10;

  const allBuckets: number[] = [];
  for (let i = fromTime.getTime(); i < toTime.getTime(); i += timeBuckets) {
    allBuckets.push(i);
  }

  const startBucket = fromTime.getTime();

  const bucketPredicate = (
    dataPoint: ProcessedData,
  ): HashableField | undefined => {
    const time = dataPoint.object[timeCol];
    const timeCasted = asDateField(time);
    if (timeCasted.errors) {
      return; // skip this data point
    }

    return {
      type: "date",
      value:
        Math.floor((timeCasted.value - startBucket) / timeBuckets) *
          timeBuckets +
        startBucket,
    };
  };

  const result = bucketData(
    dataPoints,
    timeCol,
    bucketPredicate,
    functions,
    groupBy,
  );

  const { aggregatedBucketData, yAxis } = buildAggregatedBuckets(
    result.data, timeCol, result.groupByColumns, result.aggregatedColumns,
  );

  const buckets = Array.from(yAxis)
    .slice(0, maxBuckets === -1 ? undefined : maxBuckets)
    .map((bucket) => {
      return {
        name: bucket,
        color: getRandomColor(),
      };
    });

  return {
    events,
    table: {
      type: "table",
      columns: result.columns,
      dataPoints: result.data,
    },
    view: {
      type: "view",
      data: Array.from(aggregatedBucketData.values()),
      XAxis: timeCol,
      YAxis: buckets,
      allBuckets: allBuckets,
    },
  };
};

export const parseTimeSpan = (span: string): number => {
  const unit = span[span.length - 1];
  const value = parseInt(span.slice(0, -1), 10);

  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 1000 * 60;
    case "h":
      return value * 1000 * 60 * 60;
    case "d":
      return value * 1000 * 60 * 60 * 24;
    default:
      throw new Error(`Invalid time unit: ${unit}`);
  }
};

const getRandomColor = () => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
};
