import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";

export const queryHistory = sqliteTable(
  "query_history",
  {
    id: text("id").primaryKey(),
    searchTerm: text("search_term").notNull(),
    searchProfile: text("search_profile").notNull(),
    createdAt: integer("created_at").notNull(),
    completedAt: integer("completed_at"),
    rowCount: integer("row_count"),
    status: text("status").notNull(),
    error: text("error"),
    subtaskIds: text("subtask_ids").notNull().default("[]"),
    fromTime: integer("from_time"),
    toTime: integer("to_time"),
    diskBytes: integer("disk_bytes"),
    eventsResultPath: text("events_result_path"),
    tableResultPath: text("table_result_path"),
    tableResultColumns: text("table_result_columns"), // JSON array of column names
    viewResultPath: text("view_result_path"),
  },
  (t) => [index("idx_history_created_at").on(t.createdAt)],
);

export const subtaskHistory = sqliteTable(
  "subtask_history",
  {
    id: text("id").primaryKey(),
    dedupKey: text("dedup_key").notNull(),
    dataDir: text("data_dir").notNull(),
    adapterLock: text("adapter_lock").notNull().default("{}"),
    searchTerm: text("search_term").notNull(),
    searchProfile: text("search_profile").notNull(),
    fromTime: integer("from_time"),
    toTime: integer("to_time"),
    status: text("status").notNull(),
    createdAt: integer("created_at").notNull(),
    rowCount: integer("row_count"),
    diskBytes: integer("disk_bytes"),
    fromDedup: integer("from_dedup", { mode: "boolean" }).notNull().default(false),
  },
  (t) => [index("idx_subtask_dedup").on(t.dedupKey)],
);

export const subtaskChunks = sqliteTable(
  "subtask_chunks",
  {
    id: text("id").primaryKey(),
    dedupKey: text("dedup_key").notNull(),
    chunkPath: text("chunk_path").notNull(),
    rowCount: integer("row_count").notNull(),
    diskBytes: integer("disk_bytes"),
    minTime: integer("min_time"),
    maxTime: integer("max_time"),
    writtenAt: integer("written_at").notNull(),
  },
  (t) => [index("idx_chunks_dedup_key").on(t.dedupKey)],
);

export const subtaskChunkRefs = sqliteTable(
  "subtask_chunk_refs",
  {
    subtaskId: text("subtask_id").notNull(),
    chunkId: text("chunk_id").notNull(),
    fromCache: integer("from_cache", { mode: "boolean" }).notNull().default(false),
  },
  (t) => [index("idx_chunk_refs_subtask").on(t.subtaskId)],
);
