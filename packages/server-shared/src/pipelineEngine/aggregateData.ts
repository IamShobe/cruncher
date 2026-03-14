import {
  asDisplayString,
  asNumberField,
  Field,
  HashableField,
  isNotDefined,
  ProcessedData,
} from "@cruncher/adapter-utils/logTypes";
import { AggregationFunction } from "@cruncher/qql/grammar";

export const SUPPORTED_AGG_FUNCTIONS = [
  "first",
  "last",
  "count",
  "sum",
  "avg",
  "min",
  "max",
] as const;

type SupportedAggFunction = (typeof SUPPORTED_AGG_FUNCTIONS)[number];

type FuncAccumulator = {
  func: SupportedAggFunction;
  column: string | undefined;
  resultColumnName: string;
  firstVal: Field | undefined;
  lastVal: Field | undefined;
  sum: number;
  min: number;
  max: number;
};

export const aggregateData = (
  dataPoints: ProcessedData[],
  functions: AggregationFunction[],
  groupBy: string[] | undefined,
) => {
  const groups: Record<string, ProcessedData[]> = {};

  for (const dataPoint of dataPoints) {
    const groupKey = groupBy
      ? groupBy
          .map((column) => asDisplayString(dataPoint.object[column]) ?? "")
          .join(",")
      : "all";
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }

    groups[groupKey].push(dataPoint);
  }

  const getFuncColName = (func: AggregationFunction) => {
    if (func.alias) {
      return func.alias;
    }

    return func.column ? `${func.function}(${func.column})` : func.function;
  };

  // Validate all function names upfront
  for (const funcDef of functions) {
    if (
      !SUPPORTED_AGG_FUNCTIONS.includes(
        funcDef.function as SupportedAggFunction,
      )
    ) {
      throw new Error(`Function '${funcDef.function}' is not supported`);
    }
  }

  const processedData: ProcessedData[] = [];
  for (const groupKey in groups) {
    const groupData = groups[groupKey];
    const dataPoint: ProcessedData = {
      object: {},
      message: "",
    };

    for (const column of groupBy ?? []) {
      dataPoint.object[column] = groupData?.[0].object[column];
    }

    // Initialize accumulators for all functions
    const accumulators: FuncAccumulator[] = functions.map((funcDef) => ({
      func: funcDef.function as SupportedAggFunction,
      column: funcDef.column,
      resultColumnName: getFuncColName(funcDef),
      firstVal: undefined,
      lastVal: undefined,
      sum: 0,
      min: Infinity,
      max: -Infinity,
    }));

    // Single pass over groupData — update all accumulators simultaneously
    for (const dp of groupData) {
      for (const acc of accumulators) {
        const val =
          acc.column !== undefined ? dp.object[acc.column] : undefined;

        if (acc.firstVal === undefined && val !== undefined) {
          acc.firstVal = val;
        }
        if (val !== undefined) {
          acc.lastVal = val;
        }

        if (
          (acc.func === "sum" ||
            acc.func === "avg" ||
            acc.func === "min" ||
            acc.func === "max") &&
          val !== undefined &&
          val !== null
        ) {
          const num = asNumberField(val);
          if (num.errors !== undefined) {
            throw new Error("Data values are not numbers");
          }
          acc.sum += num.value;
          if (num.value < acc.min) acc.min = num.value;
          if (num.value > acc.max) acc.max = num.value;
        }
      }
    }

    // Emit accumulator results
    for (const acc of accumulators) {
      switch (acc.func) {
        case "first":
          dataPoint.object[acc.resultColumnName] = acc.firstVal;
          break;
        case "last":
          dataPoint.object[acc.resultColumnName] = acc.lastVal;
          break;
        case "count":
          dataPoint.object[acc.resultColumnName] = {
            type: "number",
            value: groupData.length,
          };
          break;
        case "sum":
          dataPoint.object[acc.resultColumnName] = {
            type: "number",
            value: acc.sum,
          };
          break;
        case "avg":
          dataPoint.object[acc.resultColumnName] = {
            type: "number",
            value: acc.sum / groupData.length,
          };
          break;
        case "min":
          dataPoint.object[acc.resultColumnName] = {
            type: "number",
            value: acc.min,
          };
          break;
        case "max":
          dataPoint.object[acc.resultColumnName] = {
            type: "number",
            value: acc.max,
          };
          break;
        default:
          throw new Error(`Function '${acc.func}' not implemented`);
      }
    }

    processedData.push(dataPoint);
  }

  const groupByColumns = groupBy ?? [];
  const aggregatedColumns = functions.map(getFuncColName);
  const allColumns = [...groupByColumns, ...aggregatedColumns];

  return {
    data: processedData,
    columns: allColumns,
    groupByColumns: groupByColumns,
    aggregatedColumns: aggregatedColumns,
  };
};

export const bucketData = (
  dataPoints: ProcessedData[],
  bucketName: string,
  bucketPredicate: (data: ProcessedData) => HashableField | undefined,
  functions: AggregationFunction[],
  groupBy: string[] | undefined,
) => {
  const buckets: Map<HashableField["value"], ProcessedData[]> = new Map();
  let bucketType: HashableField["type"] = "string";

  for (const dataPoint of dataPoints) {
    const bucketValue = bucketPredicate(dataPoint);
    if (isNotDefined(bucketValue)) {
      continue; // skip this data point
    }

    const bucketKey = bucketValue.value;
    bucketType = bucketValue.type;

    let existing = buckets.get(bucketKey);
    if (!existing) {
      existing = [];
      buckets.set(bucketKey, existing);
    }

    existing.push(dataPoint);
  }

  const processedData: ProcessedData[] = [];
  const columns = new Set([bucketName]);
  const aggregatedColumns = new Set<string>();
  for (const [bucketValue, bucketData] of buckets.entries()) {
    const aggregatedData = aggregateData(bucketData, functions, groupBy);
    aggregatedData.data.forEach((dataPoint) => {
      dataPoint.object[bucketName] = {
        type: bucketType,
        value: bucketValue,
      } as HashableField;

      processedData.push(dataPoint);
    });

    aggregatedData.columns.forEach((column) => columns.add(column));
    aggregatedData.aggregatedColumns.forEach((column) =>
      aggregatedColumns.add(column),
    );
  }

  // dedupe columns - but keep the order
  const uniqueColumns = Array.from(columns);

  return {
    data: processedData,
    columns: uniqueColumns,
    groupByColumns: groupBy ?? [],
    aggregatedColumns: Array.from(aggregatedColumns),
  };
};
