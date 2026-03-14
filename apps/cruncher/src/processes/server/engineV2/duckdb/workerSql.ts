/**
 * Pure SQL constants and builders used by the DuckDB worker thread.
 * This file must NOT import from @cruncher/qql or any heavy dependency,
 * since it is loaded directly by the worker process via tsx.
 */

function escapeSql(p: string): string {
  return p.replace(/'/g, "''");
}

function buildPathList(paths: string[]): string {
  return paths.map(p => `'${escapeSql(p)}'`).join(", ");
}

export function parquetViewSql(filePaths: string | string[]): string {
  const src = Array.isArray(filePaths)
    ? `[${buildPathList(filePaths)}]`
    : `'${escapeSql(filePaths)}'`;
  return `CREATE VIEW events AS SELECT * FROM read_parquet(${src}, union_by_name=true)`;
}

/** DDL for the in-memory subtask write-buffer table */
export const SUBTASK_BUFFER_DDL = `
CREATE TABLE IF NOT EXISTS events (
  _id        VARCHAR NOT NULL,
  _time      BIGINT  NOT NULL,
  message    VARCHAR NOT NULL DEFAULT '',
  _raw       VARCHAR,
  _unique_id VARCHAR,
  fields     JSON    NOT NULL DEFAULT '{}'
);
`;

/** DDL for the ephemeral result table used when writing a task result file */
export const RESULT_EVENTS_DDL = `
CREATE TABLE result_events (
  _id        VARCHAR NOT NULL,
  _time      BIGINT  NOT NULL,
  message    VARCHAR NOT NULL DEFAULT '',
  _raw       VARCHAR,
  _unique_id VARCHAR,
  fields     JSON    NOT NULL DEFAULT '{}'
)`;

export const SUBTASK_STATS_SQL =
  `SELECT COUNT(*) AS cnt, MIN(_time) AS min_t, MAX(_time) AS max_t FROM events`;

export function writeChunkSql(chunkPath: string): string {
  return `COPY events TO '${escapeSql(chunkPath)}' (FORMAT PARQUET, COMPRESSION ZSTD)`;
}

export function writeTaskResultSql(outputPath: string): string {
  return `COPY (SELECT * FROM result_events ORDER BY _time ASC) TO '${escapeSql(outputPath)}'
          (FORMAT PARQUET, COMPRESSION ZSTD, ROW_GROUP_SIZE 1000)`;
}

export const COUNT_RESULT_EVENTS_SQL = `SELECT COUNT(*) AS n FROM result_events`;

export function readChunksSql(fromTime: number, toTime: number): string {
  return `SELECT _id, _time, message, _raw, _unique_id, fields
          FROM events
          WHERE _time >= ${fromTime} AND _time <= ${toTime}
          ORDER BY _time DESC`;
}

export function paginateSql(limit: number, offset: number): string {
  return `SELECT * FROM events ORDER BY _time DESC LIMIT ${limit} OFFSET ${offset}`;
}

export const COUNT_EVENTS_SQL = `SELECT COUNT(*) AS cnt FROM events`;

export function closestEventSql(refTime: number): string {
  return `WITH ranked AS (
            SELECT _time, ROW_NUMBER() OVER (ORDER BY _time DESC) - 1 AS row_idx
            FROM events
          )
          SELECT _time, row_idx FROM ranked ORDER BY ABS(_time - ${refTime}) LIMIT 1`;
}

export function histogramSql(fromTime: number, toTime: number, bucketWidth: number): string {
  return `SELECT
            ((_time - ${fromTime}) / ${bucketWidth})::BIGINT * ${bucketWidth} + ${fromTime} AS timestamp,
            COUNT(*) AS count
          FROM events
          WHERE _time >= ${fromTime} AND _time <= ${toTime}
          GROUP BY 1
          ORDER BY 1`;
}

export function columnNamesSql(fromTime: number, toTime: number): string {
  return `SELECT DISTINCT unnest(json_keys(fields)) AS col
          FROM events
          WHERE _time >= ${fromTime} AND _time <= ${toTime}`;
}

