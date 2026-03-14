import { HistoryPage } from "./localstate/LocalStateDB";
import { ActiveTaskInfo, EngineStatus, TaskRef } from "./types";
import { deleteSubtasksFromDisk } from "./sessionManager";
import { EngineCtx } from "./engineCtx";

export function getLoadedTaskIds(ctx: EngineCtx): { id: string; isLive: boolean }[] {
  return ctx.taskStore.entries().map(([id, state]) => ({
    id,
    isLive: state.isLive,
  }));
}

export function getEngineStatus(ctx: EngineCtx): EngineStatus {
  const activeTasks: ActiveTaskInfo[] = ctx.taskStore.list().map((s) => ({
    taskId: s.task.id,
    status: s.task.status,
    searchTerm: s.task.input.searchTerm,
    searchProfile: s.task.input.searchProfileRef,
    createdAt: s.task.createdAt,
    error: s.task.error,
    subTaskCount: s.subTasks.length,
    subtaskIds: s.subTasks.map((st) => st.subtaskId),
    lastActivityAt: s.lastActivityAt,
    cachedRowCount:
      (s.eventsCache != null ? s.eventsResultRowCount : 0) +
      (s.tableCache != null ? s.tableResultRowCount : 0),
    cachedBytes: s.cachedBytesSnapshot,
  }));

  return {
    activeTaskCount: activeTasks.length,
    activeTasks,
    initializedPlugins: ctx.pluginRegistry.getInitializedPlugins(),
    searchProfiles: ctx.pluginRegistry.getSearchProfiles(),
    totalDiskBytes: ctx.stateDB.getTotalDiskBytes(),
    workerStats: ctx.backend.getStats(),
    historyStats: {
      totalQueryCount: ctx.stateDB.getTotalQueryCount(),
      totalRowCount: ctx.stateDB.getTotalRowCount(),
    },
  };
}

export function getQueryHistory(
  ctx: EngineCtx,
  limit: number,
  offset: number,
  search?: string,
  sortBy?: "createdAt" | "completedAt" | "diskBytes" | "rowCount" | "status",
  sortDir?: "asc" | "desc",
): HistoryPage {
  return ctx.stateDB.getHistory({ limit, offset, search, sortBy, sortDir });
}

export async function deleteHistoryEntry(ctx: EngineCtx, id: string): Promise<void> {
  if (ctx.taskStore.get(id as TaskRef)) {
    await ctx.releaseTaskResources(id as TaskRef);
  }

  const entry = ctx.stateDB.getEntry(id);
  ctx.stateDB.deleteEntry(id);
  if (!entry || entry.subtaskIds.length === 0) return;

  deleteSubtasksFromDisk(ctx, entry.subtaskIds);
  ctx.stateDB.deleteSubtasks(entry.subtaskIds);
}

export async function pruneHistory(ctx: EngineCtx, maxEntries: number): Promise<void> {
  const idsToDelete = ctx.stateDB.getOldestHistoryIds(maxEntries);
  for (const id of idsToDelete) {
    await deleteHistoryEntry(ctx, id);
  }
}

export async function clearQueryHistory(ctx: EngineCtx): Promise<void> {
  return pruneHistory(ctx, 0);
}

export function getSubtasksWithChunks(
  ctx: EngineCtx,
  subtaskIds: string[],
) {
  const subtasks = ctx.stateDB.getSubtasksByIds(subtaskIds);
  return subtasks.map((s) => {
    const chunks = ctx.stateDB.getChunksBySubtaskId(s.id);
    const rowCount = chunks.reduce((sum, c) => sum + c.rowCount, 0);
    return {
      ...s,
      rowCount: rowCount > 0 ? rowCount : s.rowCount,
      chunks,
    };
  });
}
