import { DisplayResults, Events, Table } from "~lib/displayTypes";
import { LogicalExpression } from "~lib/qql/grammar";
import { processLogicalExpression } from "./logicalExpression";


export const processWhere = (data: DisplayResults, logicalExpression: LogicalExpression): DisplayResults => {
    const {events, table} = data;

    const newEvents: Events = {
        type: "events",
        data: events.data.filter((processedData) => processLogicalExpression(logicalExpression, { data: processedData })),
    };

    const newTable: Table | undefined = table && {
        type: "table",
        columns: table.columns,
        dataPoints: table.dataPoints.filter((processedData) => processLogicalExpression(logicalExpression, { data: processedData })),
    };

    return {
        events: newEvents,
        table: newTable,
        view: undefined,
    }
}
