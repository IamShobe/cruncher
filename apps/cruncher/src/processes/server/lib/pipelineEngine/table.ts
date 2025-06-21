import { DisplayResults } from "~lib/displayTypes";
import { ProcessedData } from "@cruncher/adapter-utils/logTypes";
import { TableColumn } from "@cruncher/qql/grammar";

export const processTable = (
  data: DisplayResults,
  columns: TableColumn[],
): DisplayResults => {
  const { events, table } = data;
  const dataPoints = table ? table.dataPoints : events.data;

  const newColumns: string[] = [];
  for (const column of columns) {
    const columnToUse = column.alias ?? column.column;
    newColumns.push(columnToUse);
  }

  const resultDataPoints: ProcessedData[] = [];
  for (const dataPoint of dataPoints) {
    const newDataPoint: ProcessedData = {
      object: {},
      message: dataPoint.message,
    };

    for (const column of columns) {
      const columnToUse = column.alias ?? column.column;
      newDataPoint.object[columnToUse] = dataPoint.object[column.column];
    }

    resultDataPoints.push(newDataPoint);
  }

  return {
    events,
    table: {
      type: "table",
      columns: newColumns,
      dataPoints: resultDataPoints,
    },
    view: undefined,
  };
};
