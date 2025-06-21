import { processField } from "@cruncher/adapter-utils/logTypes";
import { DisplayResults } from "~lib/displayTypes";

export const processUnpack = (
  data: DisplayResults,
  columns: string[],
): DisplayResults => {
  const { events, table, view } = data;
  const dataPoints = table ? table.dataPoints : events.data;
  // Process each column
  columns.forEach((column) => {
    // try parse json
    dataPoints.forEach((dp) => {
      try {
        const addObjectFields = (obj: Record<string, unknown>) => {
          Object.entries(obj).forEach(([key, value]) => {
            const newKey = `${column}.${key}`;
            try {
              dp.object[newKey] = processField(value);
            } catch (e) {
              // If processing fails, log the error and skip this field
            }
          });
        };
        const columnField = dp.object[column];
        switch (columnField?.type) {
          case "object":
            addObjectFields(columnField.raw);
            break;
          case "string":
            try {
              const payload = JSON.parse(columnField.value);
              addObjectFields(payload);
            } catch (e) {
              throw new Error(
                `Column "${column}" is a string but could not be parsed as JSON.`,
              );
            }
            break;
          default:
            throw new Error(
              `Column "${column}" has an unsupported type: ${columnField?.type}.`,
            );
        }
      } catch (e) {
        console.error(`Error processing column "${column}":`, e);
        return {};
      }
    });
  });

  return {
    events,
    table,
    view,
  };
};
