import {
  tableFromArrays,
  tableToIPC,
  tableFromIPC,
  Table,
} from "apache-arrow";
import { ProcessedData } from "@cruncher/adapter-utils/logTypes";

const PROMOTED_COLUMNS = new Set(["_id", "_time", "message", "_raw", "_uniqueId"]);

/**
 * Serialize a batch of ProcessedData rows into Arrow IPC bytes for
 * transfer to the DuckDB worker thread.
 */
export function serializeBatch(data: ProcessedData[]): Uint8Array {
  const ids: string[] = [];
  const times: bigint[] = [];
  const messages: string[] = [];
  const raws: (string | null)[] = [];
  const uniqueIds: (string | null)[] = [];
  const fieldStrs: string[] = [];

  for (const item of data) {
    ids.push(item.id ?? "");

    const timeField = item.object["_time"];
    const timeMs =
      timeField && timeField.type === "date" ? timeField.value : 0;
    times.push(BigInt(timeMs));

    const msgField = item.object["message"];
    const msg =
      msgField && msgField.type === "string"
        ? msgField.value
        : (item.message ?? "");
    messages.push(msg as string);

    const rawField = item.object["_raw"];
    raws.push(
      rawField && rawField.type === "string" ? (rawField.value as string) : null,
    );

    const uniqueIdField = item.object["_uniqueId"];
    uniqueIds.push(
      uniqueIdField && uniqueIdField.type === "string" ? (uniqueIdField.value as string) : null,
    );

    const other: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(item.object)) {
      if (!PROMOTED_COLUMNS.has(key)) {
        other[key] = val;
      }
    }
    fieldStrs.push(JSON.stringify(other));
  }

  const table = tableFromArrays({
    _id: ids,
    _time: times,
    message: messages,
    _raw: raws,
    _unique_id: uniqueIds,
    fields: fieldStrs,
  });

  return tableToIPC(table, "stream");
}

const EVENTS_COLS = new Set([...PROMOTED_COLUMNS, "fields", "_unique_id"]);

/**
 * Deserialize DuckDB event rows back into ProcessedData[].
 * Extra columns (e.g. from `| eval`) are added as typed fields.
 */
export function deserializeRows(
  rows: Record<string, unknown>[],
): ProcessedData[] {
  return rows.map((row) => {
    let otherFields: Record<string, unknown> = {};
    try {
      otherFields =
        (JSON.parse(row["fields"] as string) as Record<string, unknown>) ?? {};
    } catch {
      console.warn(`deserializeRows: failed to parse fields JSON for row _id=${row["_id"]}`);
    }

    const rawVal = row["_raw"];
    const object: ProcessedData["object"] = {
      _time: { type: "date", value: Number(row["_time"]) },
      message: { type: "string", value: (row["message"] as string) ?? "" },
      ...(otherFields as ProcessedData["object"]),
    };

    if (rawVal != null) {
      object["_raw"] = { type: "string", value: rawVal as string };
    }

    const uniqueIdVal = row["_unique_id"];
    if (uniqueIdVal != null) {
      object["_uniqueId"] = { type: "string", value: uniqueIdVal as string };
    }

    // Computed columns added by pipeline steps (e.g. | eval x = ...)
    for (const [key, val] of Object.entries(row)) {
      if (EVENTS_COLS.has(key) || key in object || val == null) continue;
      object[key] = primitiveToField(val);
    }

    return {
      id: row["_id"] as string,
      message: (row["message"] as string) ?? "",
      object,
    } satisfies ProcessedData;
  });
}

/**
 * Deserialize arbitrary DuckDB result rows (e.g. from | stats or | table)
 * into ProcessedData[]. Columns may be top-level Parquet columns OR nested
 * inside the `fields` JSON blob (where serializeBatch stores non-promoted cols).
 */
export function deserializeTableRows(
  rows: Record<string, unknown>[],
  columns: string[],
): ProcessedData[] {
  return rows.map((row) => {
    let expandedFields: Record<string, unknown> = {};
    try {
      expandedFields = (JSON.parse(row["fields"] as string) as Record<string, unknown>) ?? {};
    } catch {
      // ignore malformed JSON
    }

    const object: ProcessedData["object"] = {};
    for (const col of columns) {
      // Top-level column takes precedence; fall back to fields JSON
      const val = row[col] ?? expandedFields[col];
      if (val == null) continue;
      // Values in fields JSON are already typed { type, value } objects
      if (typeof val === "object" && val !== null && "type" in val) {
        object[col] = val as ProcessedData["object"][string];
      } else {
        object[col] = primitiveToField(val);
      }
    }
    return { id: "", message: "", object } satisfies ProcessedData;
  });
}

function primitiveToField(
  val: unknown,
): ProcessedData["object"][string] {
  if (typeof val === "bigint") return { type: "number", value: Number(val) };
  if (typeof val === "number") return { type: "number", value: val };
  if (typeof val === "boolean") return { type: "boolean", value: val };
  return { type: "string", value: String(val) };
}

/**
 * Deserialize Arrow IPC bytes back into ProcessedData[].
 * Used in the worker when reading back inserted data (less common path).
 */
export function deserializeArrowBatch(bytes: Uint8Array): ProcessedData[] {
  const table: Table = tableFromIPC(bytes);
  const rows: Record<string, unknown>[] = [];

  const idCol = table.getChild("_id");
  const timeCol = table.getChild("_time");
  const msgCol = table.getChild("message");
  const rawCol = table.getChild("_raw");
  const uniqueIdCol = table.getChild("_unique_id");
  const fieldsCol = table.getChild("fields");

  for (let i = 0; i < table.numRows; i++) {
    rows.push({
      _id: idCol?.get(i),
      _time: timeCol?.get(i),
      message: msgCol?.get(i),
      _raw: rawCol?.get(i) ?? null,
      _unique_id: uniqueIdCol?.get(i) ?? null,
      fields: fieldsCol?.get(i),
    });
  }

  return deserializeRows(rows);
}
