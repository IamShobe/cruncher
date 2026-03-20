import * as fs from "node:fs";
import * as path from "node:path";
import { v7 as uuidv7 } from "uuid";
import { parse } from "@cruncher/qql";
import { HistoryEntry } from "./localstate/LocalStateDB";
import {
  QueryTask,
  SearchProfileRef,
  SerializableParams,
  TaskRef,
} from "./types";
import { createQueryTaskState, runPipelineAndSave } from "./pipelineExecution";
import { EngineCtx, SUBTASK_DATA_VERSION } from "./engineCtx";

export function deleteSubtasksFromDisk(
  ctx: EngineCtx,
  subtaskIds: string[],
): void {
  if (subtaskIds.length === 0) return;
  // Only delete chunk files that are not referenced by any other subtask.
  // Deleting entire directories would corrupt shared chunks (dedup/cache refs).
  const orphanedChunkPaths = ctx.stateDB.getOrphanedChunkPaths(subtaskIds);
  for (const relPath of orphanedChunkPaths) {
    const absPath = ctx.absPath(relPath);
    try {
      fs.rmSync(absPath, { force: true });
    } catch (err) {
      console.warn(`Failed to delete chunk file ${absPath}:`, err);
    }
  }
  // Remove subtask directories only if they are now empty.
  const subtasks = ctx.stateDB.getSubtasksByIds(subtaskIds);
  for (const s of subtasks) {
    const absDir = ctx.absPath(s.dataDir);
    try {
      if (fs.readdirSync(absDir).length === 0) fs.rmdirSync(absDir);
    } catch {
      // ignore – dir may not exist or may still contain shared chunks
    }
  }
}

export function listSessions(ctx: EngineCtx): HistoryEntry[] {
  return ctx.stateDB
    .getHistory({ limit: 500, offset: 0 })
    .entries
    .filter((e) => {
      if (e.status === "running") return false;
      if (e.subtaskIds.length === 0) return false;
      const subtasks = ctx.stateDB.getSubtasksByIds(e.subtaskIds);
      if (subtasks.length === 0) return false;
      return subtasks.every((s) => fs.existsSync(ctx.absPath(s.dataDir)));
    });
}

export async function deleteSession(ctx: EngineCtx, taskId: TaskRef): Promise<void> {
  if (ctx.taskStore.get(taskId)) {
    await ctx.releaseTaskResources(taskId);
  }

  const entry = ctx.stateDB.getEntry(taskId as string);
  const subtaskIds = entry?.subtaskIds ?? [];

  if (subtaskIds.length > 0) {
    deleteSubtasksFromDisk(ctx, subtaskIds);
    ctx.stateDB.deleteSubtasks(subtaskIds);
  }

  ctx.stateDB.deleteEntry(taskId as string);
  console.log(`Session ${taskId} deleted`);
}

export async function restoreSession(ctx: EngineCtx, taskId: TaskRef): Promise<void> {
  const meta = ctx.stateDB.getEntry(taskId as string);
  if (!meta) throw new Error(`Session ${taskId} not found`);

  if (meta.subtaskIds.length === 0) {
    throw new Error(`No subtasks found for session ${taskId}`);
  }

  const chunksBySubtask = ctx.stateDB.getChunkPathsForTask(meta.subtaskIds);
  const allChunkPaths = meta.subtaskIds.flatMap((id) =>
    (chunksBySubtask[id] ?? []).map((relPath) => ctx.absPath(relPath))
  );

  if (allChunkPaths.length === 0) {
    throw new Error(`No Parquet chunks found for session ${taskId}`);
  }

  const queryOptions: SerializableParams = {
    fromTime: meta.fromTime ?? meta.createdAt,
    toTime: meta.toTime ?? meta.completedAt ?? Date.now(),
    limit: 10000,
    isForced: false,
  };

  const task: QueryTask = {
    id: taskId,
    status: "completed",
    createdAt: meta.createdAt,
    error: null,
    input: {
      searchTerm: meta.searchTerm,
      searchProfileRef: meta.searchProfile as SearchProfileRef,
      queryOptions,
    },
  };

  const queryTaskState = createQueryTaskState(task);
  queryTaskState.chunkPaths = allChunkPaths;
  ctx.taskStore.set(taskId, queryTaskState);
  ctx.taskStore.trackJob(taskId);
  queryTaskState.finishedQuerying.signal();

  const parsedTree = parse(meta.searchTerm);
  const { displayResults: pipelineData, autoCompleteKeys, deferredWrites } = await runPipelineAndSave(
    ctx,
    taskId,
    parsedTree,
    queryOptions,
  );
  await deferredWrites;

  await queryTaskState.mutex.runExclusive(async () => {
    queryTaskState.lastBatchStatus = ctx.buildBatchStatus(queryTaskState, {
      scale: { from: queryOptions.fromTime, to: queryOptions.toTime },
      total: pipelineData.events.data.length,
      buckets: [],
      autoCompleteKeys,
      tableDataPoints: pipelineData.table?.dataPoints,
    });
  });

  console.log(`Session ${taskId} restored`);
}

export async function recoverInterruptedSessions(ctx: EngineCtx): Promise<void> {
  const running = ctx.stateDB.getEntriesByStatus("running");
  for (const entry of running) {
    ctx.stateDB.setStatus(entry.id, "interrupted");
    console.log(`Session ${entry.id} marked as interrupted`);
  }

  for (const entry of running) {
    for (const subtaskId of entry.subtaskIds) {
      try {
        ctx.stateDB.setSubtaskStatus(subtaskId, "interrupted");
      } catch {
        // ignore individual failures
      }
    }
  }

  _recoverOrphanedSubtasks(ctx);
}

function _recoverOrphanedSubtasks(ctx: EngineCtx): void {
  const { stateDB, sessionsDir } = ctx;
  const orphanSubtaskIds: string[] = stateDB.getUnreferencedSubtaskIds();

  // Scan disk for directories not tracked in subtask_history (Scenario B)
  const v1Dir = path.join(sessionsDir, SUBTASK_DATA_VERSION);
  const knownDataDirs = stateDB.getKnownSubtaskDataDirs();
  let diskDirNames: string[] = [];
  try {
    diskDirNames = fs.readdirSync(v1Dir);
  } catch {
    // v1 dir doesn't exist yet — no disk orphans
  }

  for (const name of diskDirNames) {
    const relPath = path.join(SUBTASK_DATA_VERSION, name);
    if (!knownDataDirs.has(relPath)) {
      const syntheticId = uuidv7();
      stateDB.upsertSubtask({
        id: syntheticId,
        dedupKey: `recovered-disk-orphan:${relPath}`,
        dataDir: relPath,
        adapterLock: { instanceRef: "unknown", pluginRef: "unknown", version: "unknown" },
        searchTerm: "[Recovered orphaned data]",
        searchProfile: "unknown",
        fromTime: null,
        toTime: null,
        status: "interrupted",
        createdAt: Date.now(),
        rowCount: null,
        diskBytes: null,
        fromDedup: false,
      });
      orphanSubtaskIds.push(syntheticId);
    }
  }

  if (orphanSubtaskIds.length === 0) return;

  // Idempotency: skip subtasks already referenced by a prior recovery entry
  const alreadyReferenced = stateDB.getStillReferencedSubtaskIds(orphanSubtaskIds);
  const trulyUnreferenced = orphanSubtaskIds.filter((id) => !alreadyReferenced.has(id));
  if (trulyUnreferenced.length === 0) return;

  // Group all orphans under a single visible "interrupted" history entry
  const recoveryTaskId = uuidv7() as TaskRef;
  stateDB.upsertHistory({
    id: recoveryTaskId,
    searchTerm: "[Recovered orphaned data]",
    searchProfile: "unknown",
    createdAt: Date.now(),
    completedAt: Date.now(),
    rowCount: null,
    status: "interrupted",
    error: `${trulyUnreferenced.length} orphaned subtask(s) recovered at startup.`,
    subtaskIds: trulyUnreferenced,
    fromTime: null,
    toTime: null,
    diskBytes: null,
  });

  console.log(
    `[recovery] Created entry ${recoveryTaskId} for ${trulyUnreferenced.length} orphaned subtask(s)`,
  );
}
