import { DisplayResults } from "~core/common/displayTypes";
import { AggregationFunction } from "~core/qql/grammar";
import { aggregateData } from "./aggregateData";


export const processStats = (data: DisplayResults, functions: AggregationFunction[], groupBy: string[] | undefined): DisplayResults => {
    const {events, table} = data;
    const dataPoints = table ? table.dataPoints : events.data;

    const result = aggregateData(dataPoints, functions, groupBy);

    return {
        events,
        table: {
            type: "table",
            columns: result.columns,
            dataPoints: result.data,
        },
        view: undefined,
    }
}
