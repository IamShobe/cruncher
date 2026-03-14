import * as path from "node:path";
import { v7 as uuidv7 } from "uuid";
import hash from "object-hash";
import { ParsedQuery } from "@cruncher/qql";
import { SerializableParams } from "./types";
import { EngineCtx, SUBTASK_DATA_VERSION } from "./engineCtx";
import { AdapterLock } from "./duckdb/sessionMeta";

export type DedupResolution = {
  subtaskId: string;
  subtaskDataDir: string;
  fromDedup: boolean;
  sourceSubtaskId: string | null;
  isReady: Promise<void>;
  /** true = caller must call _createSubtaskFetcher and register in inFlightSubtasks */
  needsFetch: boolean;
};

export function computeSubtaskDedupKey(
  parsedTree: ParsedQuery,
  searchProfile: string,
  queryOptions: SerializableParams,
  instanceRef: string,
): string {
  // toTime is intentionally excluded — coverage is checked via chunk maxTime
  // pipeline is intentionally excluded — it does not affect what data is fetched
  return hash({
    search: parsedTree.search,
    controllerParams: parsedTree.controllerParams,
    searchProfile,
    fromTime: queryOptions.fromTime,
    instanceRef,
  });
}

export function resolveSubtaskDedup(
  ctx: EngineCtx,
  dedupKey: string,
  queryOptions: SerializableParams,
  searchTerm: string,
  searchProfileRef: string,
  adapterLock: AdapterLock,
  taskId?: string,
): DedupResolution {
  const inFlight = ctx.taskStore.getInFlight(dedupKey);

  // Branch 1: In-flight dedup
  if (!queryOptions.isForced && inFlight) {
    const subtaskId = uuidv7();
    const existing = ctx.stateDB.findSubtaskByDedupKey(dedupKey);
    const subtaskDataDir = existing
      ? ctx.absPath(existing.dataDir)
      : path.join(ctx.sessionsDir, SUBTASK_DATA_VERSION, inFlight.subtaskId);

    ctx.stateDB.upsertSubtask({
      id: subtaskId,
      dedupKey,
      dataDir: ctx.relPath(subtaskDataDir),
      adapterLock,
      searchTerm,
      searchProfile: searchProfileRef,
      fromTime: queryOptions.fromTime,
      toTime: queryOptions.toTime,
      status: "running",
      createdAt: Date.now(),
      rowCount: null,
      diskBytes: null,
      fromDedup: true,
    });

    console.log(
      `Dedup in-flight: new subtask ${subtaskId} references in-flight ${inFlight.subtaskId} for task ${taskId ?? "?"}`,
    );

    return {
      subtaskId,
      subtaskDataDir,
      fromDedup: true,
      sourceSubtaskId: inFlight.subtaskId,
      isReady: inFlight.done,
      needsFetch: false,
    };
  }

  // Branch 2: Completed dedup
  if (!queryOptions.isForced) {
    const existing = ctx.stateDB.findCoveringSubtask(dedupKey, queryOptions.toTime);
    if (existing) {
      const subtaskId = uuidv7();
      ctx.stateDB.upsertSubtask({
        id: subtaskId,
        dedupKey,
        dataDir: existing.dataDir,
        adapterLock,
        searchTerm,
        searchProfile: searchProfileRef,
        fromTime: queryOptions.fromTime,
        toTime: queryOptions.toTime,
        status: "running",
        createdAt: Date.now(),
        rowCount: null,
        diskBytes: null,
        fromDedup: true,
      });

      console.log(
        `Dedup completed: new subtask ${subtaskId} reuses ${existing.id} from disk for task ${taskId ?? "?"}`,
      );

      return {
        subtaskId,
        subtaskDataDir: ctx.absPath(existing.dataDir),
        fromDedup: true,
        sourceSubtaskId: existing.id,
        isReady: Promise.resolve(),
        needsFetch: false,
      };
    }
  }

  // Branch 3: Fresh fetch (non-forced with no dedup match, or isForced)
  const subtaskId = uuidv7();
  const subtaskDataDir = path.join(ctx.sessionsDir, SUBTASK_DATA_VERSION, subtaskId);

  ctx.stateDB.upsertSubtask({
    id: subtaskId,
    dedupKey,
    dataDir: ctx.relPath(subtaskDataDir),
    adapterLock,
    searchTerm,
    searchProfile: searchProfileRef,
    fromTime: queryOptions.fromTime,
    toTime: queryOptions.toTime,
    status: "running",
    createdAt: Date.now(),
    rowCount: null,
    diskBytes: null,
    fromDedup: false,
  });

  return {
    subtaskId,
    subtaskDataDir,
    fromDedup: false,
    sourceSubtaskId: null,
    isReady: Promise.resolve(), // placeholder — caller replaces with fetch promise
    needsFetch: true,
  };
}
