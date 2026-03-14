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
