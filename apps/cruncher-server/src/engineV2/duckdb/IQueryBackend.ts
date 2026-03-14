export interface IQueryBackend {
  // SubTask — per-adapter in-memory DuckDB (write buffer for Parquet chunks)
  openSubtask(subtaskId: string, dataDir: string): Promise<void>;
  closeSubtask(subtaskId: string): Promise<void>;
  writeBatch(subtaskId: string, batch: Uint8Array): Promise<{ chunkPath: string; rowCount: number; diskBytes: number; minTime: number; maxTime: number }>;

  // Read raw chunks (time-range filter only)
  readChunks(
    chunkPaths: string[],
    fromTime: number,
    toTime: number,
  ): Promise<Record<string, unknown>[]>;

  // Write pipeline-processed results to a dedicated Parquet file
  writeTaskResult(
    arrowBytes: Uint8Array,
    outputPath: string,
  ): Promise<{ rowCount: number; diskBytes: number }>;

  // Paginate a result Parquet file
  paginateFile(
    filePath: string,
    offset: number,
    limit: number,
  ): Promise<{ rows: Record<string, unknown>[]; total: number }>;

  // Find the closest event by timestamp in a result Parquet file
  getClosestEvent(
    filePath: string,
    refTime: number,
  ): Promise<{ closest: number; rowIndex: number } | null>;

  // Compute a time-based histogram over chunk files (pure SQL aggregation, no row transfer)
  computeHistogram(
    chunkPaths: string[],
    fromTime: number,
    toTime: number,
    numBuckets: number,
  ): Promise<{ timestamp: number; count: number }[]>;

  // Collect all field names present in chunk files (fixed schema + json_keys of fields blob)
  getColumnNames(
    chunkPaths: string[],
    fromTime: number,
    toTime: number,
  ): Promise<string[]>;


  /** Wait for all in-flight worker operations to complete. */
  drain(): Promise<void>;
  terminate(): void;

  /** Returns current worker health and load stats. */
  getStats(): { inflightOps: number; pendingOps: number; isDead: boolean; totalOpsDispatched: number };
}
