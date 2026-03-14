import Database from "better-sqlite3";
import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { asc, count, desc, eq, inArray, like, max, or, sql } from "drizzle-orm";
import { runMigrations } from "./migrations";
import { queryHistory, subtaskChunks, subtaskChunkRefs, subtaskHistory } from "./schema";
import { AdapterLock } from "../duckdb/sessionMeta";

export type HistoryEntry = {
  id: string;
  searchTerm: string;
  searchProfile: string;
  createdAt: number;
  completedAt: number | null;
  rowCount: number | null;
  status: string;
  error: string | null;
  subtaskIds: string[];
  fromTime: number | null;
  toTime: number | null;
  diskBytes: number | null;
  eventsResultPath?: string | null;
  tableResultPath?: string | null;
  tableResultColumns?: string[] | null;
  viewResultPath?: string | null;
};

export type SubtaskEntry = {
  id: string;
  dedupKey: string;
  dataDir: string;
  adapterLock: AdapterLock;
  searchTerm: string;
  searchProfile: string;
  fromTime: number | null;
  toTime: number | null;
  status: string;
  createdAt: number;
  rowCount: number | null;
  diskBytes: number | null;
  fromDedup: boolean;
};

export type ChunkEntry = {
  id: string;
  dedupKey: string;
  chunkPath: string;
  rowCount: number;
  diskBytes: number | null;
  minTime: number | null;
  maxTime: number | null;
  writtenAt: number;
  fromCache?: boolean;
};

export type HistoryPage = {
  entries: HistoryEntry[];
  total: number;
  limit: number;
  offset: number;
};

export class LocalStateDB {
  private sqlite: Database.Database;
  private db: BetterSQLite3Database<typeof schema>;

  constructor(dbPath: string) {
    process.stderr.write(`[LocalStateDB] opening db: ${dbPath}\n`);
    this.sqlite = new Database(dbPath);
    this.sqlite.pragma("journal_mode = WAL");
    this.db = drizzle(this.sqlite, { schema });
    process.stderr.write(`[LocalStateDB] running migrations\n`);
    runMigrations(this.db);
    process.stderr.write(`[LocalStateDB] ready\n`);
  }

  upsertHistory(entry: HistoryEntry): void {
    this.db
      .insert(queryHistory)
      .values({
        id: entry.id,
        searchTerm: entry.searchTerm,
        searchProfile: entry.searchProfile,
        createdAt: entry.createdAt,
        completedAt: entry.completedAt ?? null,
        rowCount: entry.rowCount ?? null,
        status: entry.status,
        error: entry.error ?? null,
        subtaskIds: JSON.stringify(entry.subtaskIds),
        fromTime: entry.fromTime ?? null,
        toTime: entry.toTime ?? null,
        diskBytes: entry.diskBytes ?? null,
        eventsResultPath: entry.eventsResultPath ?? null,
        tableResultPath: entry.tableResultPath ?? null,
        tableResultColumns: entry.tableResultColumns ? JSON.stringify(entry.tableResultColumns) : null,
        viewResultPath: entry.viewResultPath ?? null,
      })
      .onConflictDoUpdate({
        target: queryHistory.id,
        set: {
          completedAt: sql`excluded.completed_at`,
          rowCount: sql`excluded.row_count`,
          status: sql`excluded.status`,
          error: sql`excluded.error`,
          subtaskIds: sql`excluded.subtask_ids`,
          fromTime: sql`COALESCE(excluded.from_time, ${queryHistory.fromTime})`,
          toTime: sql`COALESCE(excluded.to_time, ${queryHistory.toTime})`,
          diskBytes: sql`COALESCE(excluded.disk_bytes, ${queryHistory.diskBytes})`,
          eventsResultPath: sql`COALESCE(excluded.events_result_path, ${queryHistory.eventsResultPath})`,
          tableResultPath: sql`COALESCE(excluded.table_result_path, ${queryHistory.tableResultPath})`,
          tableResultColumns: sql`COALESCE(excluded.table_result_columns, ${queryHistory.tableResultColumns})`,
          viewResultPath: sql`COALESCE(excluded.view_result_path, ${queryHistory.viewResultPath})`,
        },
      })
      .run();
  }

  saveTaskResults(
    taskId: string,
    results: {
      eventsPath: string | null;
      tablePath: string | null;
      tableColumns: string[] | null;
      viewPath: string | null;
    },
  ): void {
    this.db
      .update(queryHistory)
      .set({
        eventsResultPath: results.eventsPath,
        tableResultPath: results.tablePath,
        tableResultColumns: results.tableColumns ? JSON.stringify(results.tableColumns) : null,
        viewResultPath: results.viewPath,
      })
      .where(eq(queryHistory.id, taskId))
      .run();
  }

  getTaskResults(taskId: string): {
    eventsPath: string | null;
    tablePath: string | null;
    tableColumns: string[] | null;
    viewPath: string | null;
  } | null {
    const rows = this.db
      .select({
        eventsResultPath: queryHistory.eventsResultPath,
        tableResultPath: queryHistory.tableResultPath,
        tableResultColumns: queryHistory.tableResultColumns,
        viewResultPath: queryHistory.viewResultPath,
      })
      .from(queryHistory)
      .where(eq(queryHistory.id, taskId))
      .all();
    if (!rows.length) return null;
    const r = rows[0]!;
    let tableColumns: string[] | null = null;
    if (r.tableResultColumns) {
      try {
        tableColumns = JSON.parse(r.tableResultColumns) as string[];
      } catch {
        tableColumns = null;
      }
    }
    return {
      eventsPath: r.eventsResultPath ?? null,
      tablePath: r.tableResultPath ?? null,
      tableColumns,
      viewPath: r.viewResultPath ?? null,
    };
  }

  /** Returns all non-null result file paths for cleanup purposes. */
  getAllResultFilePaths(): string[] {
    const rows = this.db
      .select({
        eventsResultPath: queryHistory.eventsResultPath,
        tableResultPath: queryHistory.tableResultPath,
        viewResultPath: queryHistory.viewResultPath,
      })
      .from(queryHistory)
      .all();

    const paths: string[] = [];
    for (const r of rows) {
      if (r.eventsResultPath) paths.push(r.eventsResultPath);
      if (r.tableResultPath) paths.push(r.tableResultPath);
      if (r.viewResultPath) paths.push(r.viewResultPath);
    }
    return paths;
  }

  getHistory(opts: {
    limit: number;
    offset: number;
    search?: string;
    sortBy?: "createdAt" | "completedAt" | "diskBytes" | "rowCount" | "status";
    sortDir?: "asc" | "desc";
  }): HistoryPage {
    const where =
      opts.search && opts.search.trim()
        ? (() => {
            const escaped = opts.search.trim().replace(/[%_\\]/g, "\\$&");
            return or(
              like(queryHistory.searchTerm, `%${escaped}%`),
              like(queryHistory.searchProfile, `%${escaped}%`),
            );
          })()
        : undefined;

    const dir = opts.sortDir ?? "desc";
    const orderFn = dir === "asc" ? asc : desc;
    // "completedAt" maps to query duration (completedAt - createdAt) so results are
    // ordered by how long each query took, with incomplete tasks last.
    const nullsLast = dir === "asc" ? sql`ASC NULLS LAST` : sql`DESC NULLS LAST`;
    let orderExpr: ReturnType<typeof asc>;
    switch (opts.sortBy) {
      case "completedAt":
        orderExpr = sql`(${queryHistory.completedAt} - ${queryHistory.createdAt}) ${nullsLast}`;
        break;
      case "diskBytes":
        orderExpr = sql`${queryHistory.diskBytes} ${nullsLast}`;
        break;
      case "rowCount":
        orderExpr = sql`${queryHistory.rowCount} ${nullsLast}`;
        break;
      case "status":
        orderExpr = orderFn(queryHistory.status);
        break;
      default:
        orderExpr = orderFn(queryHistory.createdAt);
    }

    const rows = this.db
      .select()
      .from(queryHistory)
      .where(where)
      .orderBy(orderExpr)
      .limit(opts.limit)
      .offset(opts.offset)
      .all();

    const [{ total }] = this.db
      .select({ total: count() })
      .from(queryHistory)
      .where(where)
      .all();

    const rowCounts = this.computeRowCountsFromChunks(rows.map((r) => r.id));

    const entries: HistoryEntry[] = rows.map((r) =>
      this._rowToHistoryEntry(r, rowCounts),
    );

    return { entries, total, limit: opts.limit, offset: opts.offset };
  }

  getEntry(id: string): HistoryEntry | null {
    const rows = this.db
      .select()
      .from(queryHistory)
      .where(eq(queryHistory.id, id))
      .all();
    if (!rows.length) return null;
    const r = rows[0]!;
    const rowCounts = this.computeRowCountsFromChunks([id]);
    return this._rowToHistoryEntry(r, rowCounts);
  }

  getEntriesByStatus(status: string): HistoryEntry[] {
    const rows = this.db
      .select()
      .from(queryHistory)
      .where(eq(queryHistory.status, status))
      .all();
    return rows.map((r) => this._rowToHistoryEntry(r));
  }

  setStatus(id: string, status: string): void {
    this.db
      .update(queryHistory)
      .set({ status })
      .where(eq(queryHistory.id, id))
      .run();
  }

  deleteEntry(id: string): void {
    this.db.delete(queryHistory).where(sql`${queryHistory.id} = ${id}`).run();
  }

  clearHistory(): void {
    this.db.delete(queryHistory).run();
  }

  /** Returns IDs of all history entries beyond the newest `keepCount`, ordered oldest-first. */
  getOldestHistoryIds(keepCount: number): string[] {
    const rows = this.db
      .select({ id: queryHistory.id })
      .from(queryHistory)
      .orderBy(desc(queryHistory.createdAt))
      .limit(-1)
      .offset(keepCount)
      .all();
    return rows.map((r) => r.id);
  }

  /**
   * Given a list of subtask IDs, returns the subset that are still referenced
   * by at least one query_history row. Call this AFTER deleting the row(s)
   * you're removing so only remaining references are counted.
   */
  getStillReferencedSubtaskIds(subtaskIds: string[]): Set<string> {
    if (subtaskIds.length === 0) return new Set();
    const placeholders = subtaskIds.map(() => "?").join(", ");
    const rows = this.sqlite
      .prepare(
        `SELECT DISTINCT value AS id FROM query_history, json_each(query_history.subtask_ids) WHERE value IN (${placeholders})`,
      )
      .all(...subtaskIds) as { id: string }[];
    return new Set(rows.map((r) => r.id));
  }

  /** Returns the total number of queries run (all-time). */
  getTotalQueryCount(): number {
    const [row] = this.db.select({ total: count() }).from(queryHistory).all();
    return row?.total ?? 0;
  }

  /** Returns the raw sum of row_count across all subtask chunks (not deduplicated). */
  getTotalRowCount(): number {
    const [row] = this.db
      .select({ total: sql<number | null>`COALESCE(SUM(${subtaskChunks.rowCount}), 0)` })
      .from(subtaskChunks)
      .all();
    return row?.total ?? 0;
  }

  /** Returns the total disk bytes used by all chunk files (deduped — each chunk counted once). */
  getTotalDiskBytes(): number | null {
    const [row] = this.db
      .select({ total: sql<number | null>`SUM(${subtaskChunks.diskBytes})` })
      .from(subtaskChunks)
      .all();
    return row?.total ?? null;
  }

  /** Returns id + dataDir for all subtasks. */
  getAllSubtaskDataDirs(): { id: string; dataDir: string }[] {
    return this.db.select({ id: subtaskHistory.id, dataDir: subtaskHistory.dataDir }).from(subtaskHistory).all();
  }

  /**
   * Returns IDs of subtask_history rows whose ID does not appear in any
   * query_history.subtask_ids JSON array (Scenario A orphans).
   */
  getUnreferencedSubtaskIds(): string[] {
    const rows = this.sqlite
      .prepare(
        `SELECT sh.id FROM subtask_history AS sh
         WHERE sh.id NOT IN (
           SELECT DISTINCT value
           FROM query_history, json_each(query_history.subtask_ids)
         )`,
      )
      .all() as { id: string }[];
    return rows.map((r) => r.id);
  }

  /**
   * Returns a Set of all dataDir values known to subtask_history.
   * Used to detect disk-only orphan directories (Scenario B).
   */
  getKnownSubtaskDataDirs(): Set<string> {
    const rows = this.getAllSubtaskDataDirs();
    return new Set(rows.map((r) => r.dataDir));
  }

  /**
   * Returns chunk file paths that are exclusively referenced by the given subtask IDs.
   * Call this BEFORE modifying subtask_chunk_refs so the query sees current state.
   */
  getOrphanedChunkPaths(subtaskIds: string[]): string[] {
    if (subtaskIds.length === 0) return [];
    const placeholders = subtaskIds.map(() => "?").join(", ");
    const rows = (
      this.sqlite
        .prepare(
          `SELECT DISTINCT sc.chunk_path FROM subtask_chunk_refs r
           JOIN subtask_chunks sc ON sc.id = r.chunk_id
           WHERE r.subtask_id IN (${placeholders})
             AND r.chunk_id NOT IN (
               SELECT chunk_id FROM subtask_chunk_refs
               WHERE subtask_id NOT IN (${placeholders})
             )`,
        )
        .all(...subtaskIds, ...subtaskIds) as { chunk_path: string }[]
    );
    return rows.map((r) => r.chunk_path);
  }

  /** Deletes subtask_history rows and their refs; orphaned chunks (not referenced by any other subtask) are also deleted. */
  deleteSubtasks(subtaskIds: string[]): void {
    if (subtaskIds.length === 0) return;
    // Collect chunk IDs referenced only by these subtasks before deleting refs
    const placeholders = subtaskIds.map(() => "?").join(", ");
    const orphanedChunkIds = (
      this.sqlite
        .prepare(
          `SELECT r.chunk_id FROM subtask_chunk_refs r
           WHERE r.subtask_id IN (${placeholders})
           AND r.chunk_id NOT IN (
             SELECT chunk_id FROM subtask_chunk_refs
             WHERE subtask_id NOT IN (${placeholders})
           )`,
        )
        .all(...subtaskIds, ...subtaskIds) as { chunk_id: string }[]
    ).map((r) => r.chunk_id);

    this.db.delete(subtaskChunkRefs).where(inArray(subtaskChunkRefs.subtaskId, subtaskIds)).run();
    if (orphanedChunkIds.length > 0) {
      this.db.delete(subtaskChunks).where(inArray(subtaskChunks.id, orphanedChunkIds)).run();
    }
    this.db.delete(subtaskHistory).where(inArray(subtaskHistory.id, subtaskIds)).run();
  }

  // ---------------------------------------------------------------------------
  // Subtask history methods
  // ---------------------------------------------------------------------------

  upsertSubtask(entry: SubtaskEntry): void {
    this.db
      .insert(subtaskHistory)
      .values({
        id: entry.id,
        dedupKey: entry.dedupKey,
        dataDir: entry.dataDir,
        adapterLock: JSON.stringify(entry.adapterLock),
        searchTerm: entry.searchTerm,
        searchProfile: entry.searchProfile,
        fromTime: entry.fromTime ?? null,
        toTime: entry.toTime ?? null,
        status: entry.status,
        createdAt: entry.createdAt,
        rowCount: entry.rowCount ?? null,
        diskBytes: entry.diskBytes ?? null,
        fromDedup: entry.fromDedup,
      })
      .onConflictDoUpdate({
        target: subtaskHistory.id,
        set: {
          status: sql`excluded.status`,
          rowCount: sql`excluded.row_count`,
          diskBytes: sql`excluded.disk_bytes`,
        },
      })
      .run();
  }

  /**
   * Create a task and its subtasks atomically in a single SQLite transaction.
   */
  createTaskWithSubtasks(taskEntry: HistoryEntry, subtaskEntries: SubtaskEntry[]): void {
    this.sqlite.transaction(() => {
      this.upsertHistory(taskEntry);
      for (const subtask of subtaskEntries) {
        this.upsertSubtask(subtask);
      }
    })();
  }

  findSubtaskByDedupKey(dedupKey: string): SubtaskEntry | null {
    const rows = this.db
      .select()
      .from(subtaskHistory)
      .where(
        sql`${subtaskHistory.dedupKey} = ${dedupKey} AND ${subtaskHistory.status} = 'completed'`,
      )
      .orderBy(desc(subtaskHistory.createdAt))
      .limit(1)
      .all();
    if (!rows.length) return null;
    const r = rows[0]!;
    return this._mapSubtaskRow(r);
  }

  /**
   * Find a completed subtask matching the dedupKey that covers requiredToTime.
   * Primary check: subtask.toTime >= requiredToTime (the subtask was fetched for a range
   * that covers the new query's end time). Falls back to chunk maxTime for legacy rows.
   */
  findCoveringSubtask(dedupKey: string, requiredToTime: number): SubtaskEntry | null {
    // Find the most recent completed subtask for this dedupKey
    const subtaskRows = this.db
      .select()
      .from(subtaskHistory)
      .where(
        sql`${subtaskHistory.dedupKey} = ${dedupKey} AND ${subtaskHistory.status} = 'completed'`,
      )
      .orderBy(desc(subtaskHistory.createdAt))
      .all();

    for (const r of subtaskRows) {
      // Primary: use the subtask's recorded toTime — it reflects the queried range,
      // not the last event timestamp (which is typically earlier than toTime).
      if (r.toTime != null && r.toTime >= requiredToTime) {
        return this._mapSubtaskRow(r);
      }

      // Fallback for legacy rows without toTime: check chunk maxTime via refs
      const result = this.db
        .select({ maxTime: max(subtaskChunks.maxTime) })
        .from(subtaskChunkRefs)
        .innerJoin(subtaskChunks, eq(subtaskChunks.id, subtaskChunkRefs.chunkId))
        .where(eq(subtaskChunkRefs.subtaskId, r.id))
        .all();

      const maxTime = result[0]?.maxTime ?? null;
      if (maxTime !== null && maxTime >= requiredToTime) {
        return this._mapSubtaskRow(r);
      }
    }

    return null;
  }

  setSubtaskStatus(id: string, status: string): void {
    this.db
      .update(subtaskHistory)
      .set({ status })
      .where(eq(subtaskHistory.id, id))
      .run();
  }

  updateSubtaskStats(id: string, rowCount: number, diskBytes: number | null): void {
    this.db
      .update(subtaskHistory)
      .set({ rowCount, diskBytes })
      .where(eq(subtaskHistory.id, id))
      .run();
  }

  getSubtasksByIds(ids: string[]): SubtaskEntry[] {
    if (ids.length === 0) return [];
    const rows = this.db
      .select()
      .from(subtaskHistory)
      .where(inArray(subtaskHistory.id, ids))
      .all();
    return rows.map((r) => this._mapSubtaskRow(r));
  }

  deleteSubtask(id: string): void {
    // Delete chunks that are only referenced by this subtask
    const orphanedChunkIds = (
      this.sqlite
        .prepare(
          `SELECT r.chunk_id FROM subtask_chunk_refs r
           WHERE r.subtask_id = ?
           AND r.chunk_id NOT IN (
             SELECT chunk_id FROM subtask_chunk_refs WHERE subtask_id != ?
           )`,
        )
        .all(id, id) as { chunk_id: string }[]
    ).map((r) => r.chunk_id);

    this.db.delete(subtaskChunkRefs).where(eq(subtaskChunkRefs.subtaskId, id)).run();
    if (orphanedChunkIds.length > 0) {
      this.db.delete(subtaskChunks).where(inArray(subtaskChunks.id, orphanedChunkIds)).run();
    }
    this.db.delete(subtaskHistory).where(eq(subtaskHistory.id, id)).run();
  }

  // ---------------------------------------------------------------------------
  // Row-count helpers (always derived from chunks — single source of truth)
  // ---------------------------------------------------------------------------

  /**
   * For each task ID, returns the sum of row_count across all its subtask chunks.
   * Use this instead of query_history.row_count for accurate live/in-progress counts.
   */
  computeRowCountsFromChunks(taskIds: string[]): Map<string, number> {
    if (taskIds.length === 0) return new Map();
    const placeholders = taskIds.map(() => "?").join(", ");
    const rows = this.sqlite
      .prepare(
        `SELECT q.id, COALESCE(SUM(sc.row_count), 0) AS row_count
         FROM query_history q
         LEFT JOIN json_each(q.subtask_ids) j ON 1=1
         LEFT JOIN subtask_chunk_refs r ON r.subtask_id = j.value
         LEFT JOIN subtask_chunks sc ON sc.id = r.chunk_id
         WHERE q.id IN (${placeholders})
         GROUP BY q.id`,
      )
      .all(...taskIds) as { id: string; row_count: number }[];
    return new Map(rows.map((r) => [r.id, Number(r.row_count)]));
  }

  // ---------------------------------------------------------------------------
  // Chunk methods
  // ---------------------------------------------------------------------------

  insertChunk(chunk: ChunkEntry): void {
    this.db
      .insert(subtaskChunks)
      .values({
        id: chunk.id,
        dedupKey: chunk.dedupKey,
        chunkPath: chunk.chunkPath,
        rowCount: chunk.rowCount,
        diskBytes: chunk.diskBytes ?? null,
        minTime: chunk.minTime ?? null,
        maxTime: chunk.maxTime ?? null,
        writtenAt: chunk.writtenAt,
      })
      .run();
  }

  addChunkRef(subtaskId: string, chunkId: string, fromCache = false): void {
    this.db
      .insert(subtaskChunkRefs)
      .values({ subtaskId, chunkId, fromCache })
      .run();
  }

  /** Returns chunks for a subtask via the join table, including per-ref fromCache flag. */
  getChunksBySubtaskId(subtaskId: string): ChunkEntry[] {
    return this.db
      .select({
        id: subtaskChunks.id,
        dedupKey: subtaskChunks.dedupKey,
        chunkPath: subtaskChunks.chunkPath,
        rowCount: subtaskChunks.rowCount,
        diskBytes: subtaskChunks.diskBytes,
        minTime: subtaskChunks.minTime,
        maxTime: subtaskChunks.maxTime,
        writtenAt: subtaskChunks.writtenAt,
        fromCache: subtaskChunkRefs.fromCache,
      })
      .from(subtaskChunkRefs)
      .innerJoin(subtaskChunks, eq(subtaskChunks.id, subtaskChunkRefs.chunkId))
      .where(eq(subtaskChunkRefs.subtaskId, subtaskId))
      .all()
      .map((r) => ({
        ...r,
        diskBytes: r.diskBytes ?? null,
        minTime: r.minTime ?? null,
        maxTime: r.maxTime ?? null,
        fromCache: r.fromCache ?? false,
      }));
  }

  /** Returns all chunks for a given dedupKey directly from subtask_chunks. */
  getChunksByDedupKey(dedupKey: string): ChunkEntry[] {
    return this.db
      .select()
      .from(subtaskChunks)
      .where(eq(subtaskChunks.dedupKey, dedupKey))
      .all()
      .map((r) => ({
        id: r.id,
        dedupKey: r.dedupKey,
        chunkPath: r.chunkPath,
        rowCount: r.rowCount,
        diskBytes: r.diskBytes ?? null,
        minTime: r.minTime ?? null,
        maxTime: r.maxTime ?? null,
        writtenAt: r.writtenAt,
      }));
  }

  getChunkPathsForTask(subtaskIds: string[]): Record<string, string[]> {
    if (subtaskIds.length === 0) return {};
    const rows = this.db
      .select({ subtaskId: subtaskChunkRefs.subtaskId, chunkPath: subtaskChunks.chunkPath })
      .from(subtaskChunkRefs)
      .innerJoin(subtaskChunks, eq(subtaskChunks.id, subtaskChunkRefs.chunkId))
      .where(inArray(subtaskChunkRefs.subtaskId, subtaskIds))
      .all();

    const result: Record<string, string[]> = {};
    for (const r of rows) {
      if (!result[r.subtaskId]) result[r.subtaskId] = [];
      result[r.subtaskId]!.push(r.chunkPath);
    }
    return result;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private _rowToHistoryEntry(
    r: typeof queryHistory.$inferSelect,
    rowCounts?: Map<string, number>,
  ): HistoryEntry {
    let subtaskIds: string[];
    try {
      subtaskIds = JSON.parse(r.subtaskIds ?? "[]") as string[];
    } catch {
      subtaskIds = [];
    }
    let tableResultColumns: string[] | null = null;
    if (r.tableResultColumns) {
      try {
        tableResultColumns = JSON.parse(r.tableResultColumns) as string[];
      } catch {
        tableResultColumns = null;
      }
    }
    return {
      id: r.id,
      searchTerm: r.searchTerm,
      searchProfile: r.searchProfile,
      createdAt: r.createdAt,
      completedAt: r.completedAt ?? null,
      rowCount: rowCounts ? (rowCounts.get(r.id) ?? r.rowCount ?? null) : (r.rowCount ?? null),
      status: r.status,
      error: r.error ?? null,
      subtaskIds,
      fromTime: r.fromTime ?? null,
      toTime: r.toTime ?? null,
      diskBytes: r.diskBytes ?? null,
      eventsResultPath: r.eventsResultPath ?? null,
      tableResultPath: r.tableResultPath ?? null,
      tableResultColumns,
      viewResultPath: r.viewResultPath ?? null,
    };
  }

  private _mapSubtaskRow(r: typeof subtaskHistory.$inferSelect): SubtaskEntry {
    return {
      id: r.id,
      dedupKey: r.dedupKey,
      dataDir: r.dataDir,
      adapterLock: JSON.parse(r.adapterLock ?? '{"instanceRef":"unknown","pluginRef":"unknown","version":"unknown"}') as AdapterLock,
      searchTerm: r.searchTerm,
      searchProfile: r.searchProfile,
      fromTime: r.fromTime ?? null,
      toTime: r.toTime ?? null,
      status: r.status,
      createdAt: r.createdAt,
      rowCount: r.rowCount ?? null,
      diskBytes: r.diskBytes ?? null,
      fromDedup: r.fromDedup ?? false,
    };
  }

  close(): void {
    this.sqlite.close();
  }
}
