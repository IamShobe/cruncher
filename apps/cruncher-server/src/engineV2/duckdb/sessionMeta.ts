import * as fs from "node:fs";
import * as path from "node:path";
import type { AdapterLock, SessionMeta, SessionStatus } from "@cruncher/server-shared";

export type { AdapterLock, SessionMeta, SessionStatus };

const EXT_META = ".meta.json";

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
