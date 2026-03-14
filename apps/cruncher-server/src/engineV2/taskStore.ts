import { finishedStatuses, QueryTaskState, TaskRef } from "./types";

export class TaskStore {
  private queryTasks: Record<string, QueryTaskState> = {};
  private executedJobs: Set<TaskRef> = new Set();
  private inFlightSubtasks = new Map<string, { subtaskId: string; done: Promise<void> }>();

  get(id: TaskRef): QueryTaskState | undefined {
    return this.queryTasks[id as string];
  }

  set(id: TaskRef, state: QueryTaskState): void {
    this.queryTasks[id as string] = state;
  }

  delete(id: TaskRef): void {
    delete this.queryTasks[id as string];
  }

  list(): QueryTaskState[] {
    return Object.values(this.queryTasks);
  }

  entries(): Array<[string, QueryTaskState]> {
    return Object.entries(this.queryTasks);
  }

  activeSubtaskIds(): Set<string> {
    const ids = new Set<string>();
    for (const state of Object.values(this.queryTasks)) {
      for (const st of state.subTasks) {
        ids.add(st.subtaskId);
      }
    }
    return ids;
  }

  // --- executedJobs ---

  trackJob(id: TaskRef): void {
    this.executedJobs.add(id);
  }

  untrackJob(id: TaskRef): void {
    this.executedJobs.delete(id);
  }

  listExecutedJobs(): TaskRef[] {
    return [...this.executedJobs];
  }

  // --- inFlightSubtasks ---

  getInFlight(dedupKey: string): { subtaskId: string; done: Promise<void> } | undefined {
    return this.inFlightSubtasks.get(dedupKey);
  }

  setInFlight(dedupKey: string, val: { subtaskId: string; done: Promise<void> }): void {
    this.inFlightSubtasks.set(dedupKey, val);
  }

  deleteInFlight(dedupKey: string): void {
    this.inFlightSubtasks.delete(dedupKey);
  }

  clearAll(): void {
    this.queryTasks = {};
    this.inFlightSubtasks.clear();
    this.executedJobs = new Set();
  }
}

export function stopTask(taskState: QueryTaskState): void {
  if (!finishedStatuses.has(taskState.task.status)) {
    taskState.task.status = "canceled";
  }
  taskState.abortController.abort();
  taskState.finishedQuerying.signal();
}
