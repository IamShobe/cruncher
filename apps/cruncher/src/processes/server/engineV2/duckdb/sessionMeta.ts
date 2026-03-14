import * as fs from "node:fs";
import * as path from "node:path";

export type SessionStatus =
  | "running"
  | "completed"
  | "failed"
  | "canceled"
  | "interrupted";

export interface AdapterLock {
  instanceRef: string;
  pluginRef: string;
  version: string;
}

export interface SessionMeta {
  taskId: string;
  searchTerm: string;
  searchProfile: string;
  createdAt: number;
  completedAt: number | null;
  rowCount: number | null;
  status: SessionStatus;
  adapters: AdapterLock[];
}

const EXT_META = ".meta.json";
const EXT_DB   = ".duckdb";
const EXT_WAL  = ".duckdb.wal";

export function isFileNotFoundError(err: unknown): boolean {
  return (err as NodeJS.ErrnoException).code === "ENOENT";
}

export function writeSessionMeta(
  sessionsDir: string,
  meta: SessionMeta,
): void {
  const filePath = path.join(sessionsDir, `${meta.taskId}${EXT_META}`);
  const tmpPath = filePath + ".tmp";
  fs.writeFileSync(tmpPath, JSON.stringify(meta, null, 2), "utf-8");
  fs.renameSync(tmpPath, filePath);
}

export function updateSessionMeta(
  sessionsDir: string,
  taskId: string,
  patch: Partial<SessionMeta>,
): void {
  const existing = readSessionMeta(sessionsDir, taskId);
  if (!existing) return;
  writeSessionMeta(sessionsDir, { ...existing, ...patch });
}

export function readSessionMeta(
  sessionsDir: string,
  taskId: string,
): SessionMeta | null {
  const filePath = path.join(sessionsDir, `${taskId}${EXT_META}`);
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as SessionMeta;
  } catch (err) {
    if (!isFileNotFoundError(err)) {
      console.warn(`[sessionMeta] Failed to read ${filePath}:`, err);
    }
    return null;
  }
}

export function listSessionMetas(sessionsDir: string): SessionMeta[] {
  let files: string[];
  try {
    files = fs.readdirSync(sessionsDir);
  } catch (err) {
    if (!isFileNotFoundError(err)) {
      console.warn(`[sessionMeta] Failed to read sessions directory ${sessionsDir}:`, err);
    }
    return [];
  }

  const metas: SessionMeta[] = [];
  for (const file of files) {
    if (!file.endsWith(EXT_META)) continue;
    const filePath = path.join(sessionsDir, file);
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      metas.push(JSON.parse(raw) as SessionMeta);
    } catch (err) {
      if (!isFileNotFoundError(err)) {
        console.warn(`[sessionMeta] Failed to read ${filePath}, skipping:`, err);
      }
    }
  }
  return metas;
}

export function deleteSessionFiles(
  sessionsDir: string,
  taskId: string,
): void {
  for (const ext of [EXT_DB, EXT_WAL, EXT_META]) {
    const filePath = path.join(sessionsDir, `${taskId}${ext}`);
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      if (!isFileNotFoundError(err)) {
        console.warn(`[sessionMeta] Failed to delete ${filePath}:`, err);
      }
    }
  }
}
