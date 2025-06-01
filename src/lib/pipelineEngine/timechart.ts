import { DisplayResults } from "~lib/displayTypes";
import { asDateField, HashableField, isHashableField, ProcessedData } from "~lib/adapters/logTypes";
import { AggregationFunction, TimeChartParams } from "~lib/qql/grammar";
import { bucketData } from "./aggregateData";


export const processTimeChart = (
    data: DisplayResults,
    functions: AggregationFunction[],
    groupBy: string[] | undefined,
    fromTime: Date,
    toTime: Date,
    params: TimeChartParams,
): DisplayResults => {
    const { events, table } = data;
    const dataPoints = table ? table.dataPoints : events.data;

    const timeCol = params.timeColumn ?? "_time";
    const timeBuckets = parseTimeSpan(params.span ?? "5m");
    const maxBuckets = params.maxGroups ?? 10;

    const allBuckets: number[] = [];
    for (let i = fromTime.getTime(); i < toTime.getTime(); i += timeBuckets) {
        allBuckets.push(i);
    }

    const startBucket = fromTime.getTime();

    const bucketPredicate = (dataPoint: ProcessedData): HashableField | undefined => {
        const time = dataPoint.object[timeCol];
        const timeCasted = asDateField(time);
        if (timeCasted.errors) {
            return; // skip this data point
        }

        return {
            type: "date",
            value: Math.floor((timeCasted.value - startBucket) / timeBuckets) * timeBuckets + startBucket
        };
    };

    const result = bucketData(dataPoints, timeCol, bucketPredicate, functions, groupBy);


    const yAxis = new Set<string>();
    const aggregatedBucketData: Map<number, ProcessedData> = new Map();

    for (const dataPoint of result.data) {
        const time = asDateField(dataPoint.object[timeCol]).value;
        const key = result.groupByColumns.reduce((acc, col) => {
            return acc + (dataPoint.object[col]?.value.toString() ?? "");
        }, "");

        const allYAxis: Record<string, HashableField> = {};
        for (const col of result.aggregatedColumns) {
            if (!isHashableField(dataPoint.object[col])) {
                continue;
            }

            const value = dataPoint.object[col];

            const fullKey = [key, col].join("_");
            allYAxis[fullKey] = value;
            yAxis.add(fullKey);
        }

        let existing = aggregatedBucketData.get(time);
        if (!existing) {
            existing = {
                object: {
                    [timeCol]: dataPoint.object[timeCol],
                },
                message: "",
            };
            aggregatedBucketData.set(time, existing);
        }

        Object.entries(allYAxis).forEach(([key, value]) => {
            existing.object[key] = value;
        });
    }

    const buckets = Array.from(yAxis).slice(0, maxBuckets === -1 ? undefined : maxBuckets).map((bucket) => {
        return {
            name: bucket,
            color: getRandomColor(),
        }
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
}

const parseTimeSpan = (span: string): number => {
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
}


const getRandomColor = () => {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
};  