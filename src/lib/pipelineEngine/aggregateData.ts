import { asDisplayString, asNumberField, Field, HashableField, isNotDefined, NumberField, ProcessedData } from "~lib/adapters/logTypes";
import { AggregationFunction } from "~lib/qql/grammar";


const assertDataValuesAsNumbers = (input: Field[]): input is (NumberField | undefined | null)[] => {
    return input.every((value) => value === undefined || value === null || asNumberField(value).errors === undefined);
}

export const SUPPORTED_AGG_FUNCTIONS = ["first", "last", "count", "sum", "avg", "min", "max"] as const;

type SupportedAggFunction = typeof SUPPORTED_AGG_FUNCTIONS[number];

// TODO: IMPLEMENT IT MORE EFFICIENTLY!
export const aggregateData = (dataPoints: ProcessedData[], functions: AggregationFunction[], groupBy: string[] | undefined) => {
    const groups: Record<string, ProcessedData[]> = {};

    for (const dataPoint of dataPoints) {
        const groupKey = groupBy ? groupBy.map((column) => asDisplayString(dataPoint.object[column]) ?? "").join(",") : "all";
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
    }

    const processedData: ProcessedData[] = [];
    for (const groupKey in groups) {
        const groupData = groups[groupKey];
        const dataPoint: ProcessedData = {
            object: {},
            message: "",
        };

        for (const column of groupBy ?? []) {
            // populate the value of the column - all objects in the group should have the same value - so we can just take the first one
            dataPoint.object[column] = groupData?.[0].object[column];
        }

        for (const funcDef of functions) {
            const columnData = groupData.map((dataPoint) => {
                if (funcDef.column === undefined) {
                    return undefined;
                }

                return dataPoint.object[funcDef.column]
            });

            const resultColumnName = getFuncColName(funcDef);

            if (!SUPPORTED_AGG_FUNCTIONS.includes(funcDef.function as SupportedAggFunction)) {
                throw new Error(`Function '${funcDef.function}' is not supported`);
            }

            const func = funcDef.function as SupportedAggFunction;

            switch (func) {
                case "first":
                    dataPoint.object[resultColumnName] = columnData.find((value) => value !== undefined);
                    break;

                case "last":
                    dataPoint.object[resultColumnName] = columnData.reverse().find((value) => value !== undefined);
                    break;

                case "count":
                    dataPoint.object[resultColumnName] = {
                        type: "number",
                        value: columnData.length
                    };
                    break;
                case "sum":
                    if (!assertDataValuesAsNumbers(columnData)) {
                        throw new Error("Data values are not numbers");
                    }

                    dataPoint.object[resultColumnName] = {
                        type: "number",
                        value: columnData.reduce((acc, value) => (acc ?? 0) + (value?.value ?? 0), 0)
                    };
                    break;
                case "avg": {
                    if (!assertDataValuesAsNumbers(columnData)) {
                        throw new Error("Data values are not numbers");
                    }

                    const res = columnData.reduce((acc, value) => (acc ?? 0) + (value?.value ?? 0), 0);

                    dataPoint.object[resultColumnName] = {
                        type: "number",
                        value: res / columnData.length,
                    }
                    break;
                }
                case "min":
                    if (!assertDataValuesAsNumbers(columnData)) {
                        throw new Error("Data values are not numbers");
                    }

                    dataPoint.object[resultColumnName] = {
                        type: "number",
                        value: Math.min(...columnData.filter((value) => value !== undefined && value !== null).map((value) => value.value))
                    };
                    break;
                case "max":
                    if (!assertDataValuesAsNumbers(columnData)) {
                        throw new Error("Data values are not numbers");
                    }

                    dataPoint.object[resultColumnName] = {
                        type: "number",
                        value: Math.max(...columnData.filter((value) => value !== undefined && value !== null).map((value) => value.value))
                    }
                    break;

                default:
                    throw new Error(`Function '${func}' not implemented`);
            }
        }

        processedData.push(dataPoint);
    }

    const groupByColumns = groupBy ?? [];
    const aggregatedColumns = functions.map(getFuncColName);
    const allColumns = [...(groupByColumns), ...aggregatedColumns];

    return {
        data: processedData,
        columns: allColumns,
        groupByColumns: groupByColumns,
        aggregatedColumns: aggregatedColumns,
    };
}

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
        aggregatedData.aggregatedColumns.forEach((column) => aggregatedColumns.add(column));
    }

    // dedupe columns - but keep the order
    const uniqueColumns = Array.from(columns);

    return {
        data: processedData,
        columns: uniqueColumns,
        groupByColumns: groupBy ?? [],
        aggregatedColumns: Array.from(aggregatedColumns),
    };
}
