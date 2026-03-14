import { generateCsv, mkConfig } from "export-to-csv";
import { ProcessedData } from "@cruncher/adapter-utils/logTypes";
import { deserializeTableRows } from "./duckdb/serialization";
import { ExportResults, TaskRef } from "./types";
import { EngineCtx } from "./engineCtx";

const csvConfig = mkConfig({ useKeysAsHeaders: true });

export function dataAsArray(processedData: ProcessedData[]): Record<string, unknown>[] {
  return processedData.map((row) => {
    const result: Record<string, unknown> = {};
    for (const key in row.object) result[key] = row.object[key]?.value;
    return result;
  });
}

export async function exportTableResults(
  ctx: EngineCtx,
  taskId: TaskRef,
  format: "csv" | "json",
): Promise<ExportResults> {
  const taskState = ctx.taskStore.get(taskId);
  if (!taskState || !taskState.tableResultColumns || (!taskState.tableResultPath && !taskState.tableCache)) {
    throw new Error(`No table data available for task ${taskId}`);
  }

  let tableData: ReturnType<typeof deserializeTableRows>;
  if (taskState.tableCache) {
    tableData = taskState.tableCache.data;
  } else {
    const { rows } = await ctx.backend.paginateFile(taskState.tableResultPath!, 0, 1_000_000);
    tableData = deserializeTableRows(rows, taskState.tableResultColumns);
  }
  const preparedData = dataAsArray(tableData);

  let payload: string;
  if (format === "csv") {
    // @ts-expect-error - generateCsv type
    payload = generateCsv(csvConfig)(preparedData) as unknown as string;
  } else {
    payload = JSON.stringify(preparedData);
  }

  return {
    payload,
    fileName: `query_results_${taskId}.${format}`,
    contentType: format === "csv" ? "text/csv" : "application/json",
  };
}
