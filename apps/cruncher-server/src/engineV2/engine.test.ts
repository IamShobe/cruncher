import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import { sub } from "date-fns";
import { expect, test, describe, afterEach } from "vitest";
import mockedData from "@cruncher/adapter-mock";
import { ExternalAuthProvider } from "@cruncher/adapter-utils";
import { Engine } from "./engine";
import { InstanceRef, SearchProfileRef, TaskRef } from "./types";

const WORKER_TS = path.join(__dirname, "duckdb", "worker.ts");

// Each test gets an isolated temp directory so tests never touch the real app
// data dir and can run while the Electron app is open.
let testDataDir: string;
let testEngine: Engine | null = null;

afterEach(async () => {
  // Terminate the engine first to close all DuckDB connections, then clean up files.
  await testEngine?.terminate();
  testEngine = null;
  if (testDataDir) {
    fs.rmSync(testDataDir, { recursive: true, force: true });
  }
});

function tmpDir(): string {
  testDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "cruncher-test-"));
  return testDataDir;
}

function trackEngine(engine: Engine): Engine {
  testEngine = engine;
  return engine;
}

test("engine register plugin", () => {
  const externalAuthProvider = {
    getCookies: () => Promise.resolve({}),
  } satisfies ExternalAuthProvider;

  const engine = trackEngine(new Engine(externalAuthProvider, { userDataPath: tmpDir() }));
  engine.registerPlugin(mockedData);

  expect(engine.getSupportedPlugins().length).toBe(1);
  expect(engine.getSupportedPlugins()[0].ref).toBe("mocked_data");
});

test("engine initialize plugin", () => {
  const externalAuthProvider = {
    getCookies: () => Promise.resolve({}),
  } satisfies ExternalAuthProvider;

  const engine = trackEngine(new Engine(externalAuthProvider, { userDataPath: tmpDir() }));
  engine.registerPlugin(mockedData);

  const plugins = engine.getSupportedPlugins();
  expect(plugins.length).toBe(1);

  const pluginToInitialize = plugins[0];

  const pluginInstance = engine.initializePlugin(
    pluginToInitialize.ref,
    "newInstance" as InstanceRef,
    {},
  );

  expect(pluginInstance).toBeDefined();
  expect(pluginInstance.pluginRef).toBe("mocked_data");
});

test("engine initialize profile", () => {
  const externalAuthProvider = {
    getCookies: () => Promise.resolve({}),
  } satisfies ExternalAuthProvider;

  const engine = trackEngine(new Engine(externalAuthProvider, { userDataPath: tmpDir() }));
  engine.registerPlugin(mockedData);

  const plugins = engine.getSupportedPlugins();
  expect(plugins.length).toBe(1);

  const pluginToInitialize = plugins[0];
  const pluginInstance = engine.initializePlugin(
    pluginToInitialize.ref,
    "newInstance" as InstanceRef,
    {},
  );
  const profile = engine.initializeSearchProfile(
    "default" as SearchProfileRef,
    [pluginInstance.name],
  );

  expect(profile).toBeDefined();
  expect(profile.name).toBe("default");
});

test("engine query", async () => {
  const externalAuthProvider = {
    getCookies: () => Promise.resolve({}),
  } satisfies ExternalAuthProvider;

  const engine = trackEngine(new Engine(externalAuthProvider, { userDataPath: tmpDir(), workerScriptPath: WORKER_TS }));
  engine.registerPlugin(mockedData);

  const plugins = engine.getSupportedPlugins();
  expect(plugins.length).toBe(1);

  const pluginToInitialize = plugins[0];
  const pluginInstance = engine.initializePlugin(
    pluginToInitialize.ref,
    "newInstance" as InstanceRef,
    {},
  );
  const searchProfile = "default" as SearchProfileRef;
  const profile = engine.initializeSearchProfile(searchProfile, [
    pluginInstance.name,
  ]);

  const task = await engine.runQuery(profile.name, "", {
    // empty search term to match all data
    fromTime: sub(new Date(), { days: 1 }).getTime(),
    toTime: new Date().getTime(),
    limit: 1000,
    isForced: false,
  });

  expect(task).toBeDefined();

  const state = engine.getTaskState(task.id);
  expect(state).toBeDefined();

  await state.finishedQuerying.wait();
  expect(state.task.status).toBe("completed");
});

// ─── Setup helpers ────────────────────────────────────────────────────────────

const makeEngine = () => {
  const authProvider: ExternalAuthProvider = {
    getCookies: () => Promise.resolve({}),
  };
  const engine = trackEngine(new Engine(authProvider, { userDataPath: tmpDir(), workerScriptPath: WORKER_TS }));
  engine.registerPlugin(mockedData);
  const instance = engine.initializePlugin(
    mockedData.ref,
    "inst" as InstanceRef,
    {},
  );
  const profile = engine.initializeSearchProfile(
    "default" as SearchProfileRef,
    [instance.name],
  );
  return { engine, profile };
};

const defaultQueryOptions = {
  fromTime: sub(new Date(), { days: 1 }).getTime(),
  toTime: new Date().getTime(),
  limit: 1000,
  isForced: false,
};

// ─── Plugin registration ──────────────────────────────────────────────────────

describe("plugin registration", () => {
  test("registering the same plugin ref twice throws", () => {
    const { engine } = makeEngine();
    expect(() => engine.registerPlugin(mockedData)).toThrow();
  });

  test("getSupportedPlugins returns plugin with JSON schema params", () => {
    const { engine } = makeEngine();
    const [plugin] = engine.getSupportedPlugins();
    expect(plugin.params).toBeDefined();
    expect(typeof plugin.params).toBe("object");
  });

  test("initializePlugin with unknown ref throws", () => {
    const authProvider: ExternalAuthProvider = {
      getCookies: () => Promise.resolve({}),
    };
    const engine = new Engine(authProvider, { userDataPath: tmpDir() });
    engine.registerPlugin(mockedData);
    expect(() =>
      engine.initializePlugin("no_such_ref" as any, "x" as InstanceRef, {}),
    ).toThrow();
  });
});

// ─── Search profile ───────────────────────────────────────────────────────────

describe("search profile", () => {
  test("initializeSearchProfile with unknown instance throws", () => {
    const authProvider: ExternalAuthProvider = {
      getCookies: () => Promise.resolve({}),
    };
    const engine = new Engine(authProvider, { userDataPath: tmpDir() });
    engine.registerPlugin(mockedData);
    expect(() =>
      engine.initializeSearchProfile("default" as SearchProfileRef, [
        "ghost" as InstanceRef,
      ]),
    ).toThrow();
  });

  test("getSearchProfiles returns the created profile", () => {
    const { engine, profile } = makeEngine();
    const profiles = engine.getSearchProfiles();
    expect(profiles.some((p) => p.name === profile.name)).toBe(true);
  });

  test("reset clears initialized plugins and search profiles", () => {
    const { engine } = makeEngine();
    engine.reset();
    expect(engine.getInitializedPlugins()).toHaveLength(0);
    expect(engine.getSearchProfiles()).toHaveLength(0);
  });
});

// ─── Query lifecycle ──────────────────────────────────────────────────────────

describe("query lifecycle", () => {
  test("runQuery on unknown profile throws", async () => {
    const { engine } = makeEngine();
    await expect(
      engine.runQuery("ghost" as SearchProfileRef, "", defaultQueryOptions),
    ).rejects.toThrow();
  });

  test("getTaskState on unknown taskId throws", () => {
    const { engine } = makeEngine();
    expect(() => engine.getTaskState("no-such-id" as TaskRef)).toThrow();
  });

  test("completed task has events data", async () => {
    const { engine, profile } = makeEngine();
    const task = await engine.runQuery(profile.name, "", defaultQueryOptions);
    const state = engine.getTaskState(task.id);
    await state.finishedQuerying.wait();
    expect(state.task.status).toBe("completed");
    expect(state.eventsResultRowCount).toBeGreaterThan(0);
  });

  test("getJobUpdates yields at least one batch status after completion", async () => {
    const { engine, profile } = makeEngine();
    const task = await engine.runQuery(profile.name, "", defaultQueryOptions);
    const state = engine.getTaskState(task.id);
    await state.finishedQuerying.wait();

    const updates: unknown[] = [];
    for await (const update of engine.getJobUpdates(task.id)) {
      updates.push(update);
    }
    expect(updates.length).toBeGreaterThan(0);
  });

  test("cancelQuery marks task as canceled", async () => {
    const { engine, profile } = makeEngine();
    const task = await engine.runQuery(profile.name, "", defaultQueryOptions);
    engine.cancelQuery(task.id);
    expect(engine.getTaskState(task.id).task.status).toBe("canceled");
  });

  test("cancelQuery on unknown taskId throws", () => {
    const { engine } = makeEngine();
    expect(() => engine.cancelQuery("no-such" as TaskRef)).toThrow();
  });

  test("releaseTaskResources removes the task", async () => {
    const { engine, profile } = makeEngine();
    const task = await engine.runQuery(profile.name, "", defaultQueryOptions);
    const state = engine.getTaskState(task.id);
    await state.finishedQuerying.wait();
    await engine.releaseTaskResources(task.id);
    expect(() => engine.getTaskState(task.id)).toThrow();
  });

  test("resetQueries clears all tasks", async () => {
    const { engine, profile } = makeEngine();
    const task = await engine.runQuery(profile.name, "", defaultQueryOptions);
    const state = engine.getTaskState(task.id);
    await state.finishedQuerying.wait();
    await engine.resetQueries();
    expect(() => engine.getTaskState(task.id)).toThrow();
  });
});

// ─── Pagination ───────────────────────────────────────────────────────────────

describe("pagination", () => {
  test("getLogsPaginated returns the requested slice", async () => {
    const { engine, profile } = makeEngine();
    const task = await engine.runQuery(profile.name, "", defaultQueryOptions);
    const state = engine.getTaskState(task.id);
    await state.finishedQuerying.wait();

    const total = state.eventsResultRowCount;
    const page = await engine.getLogsPaginated(task.id, 0, 2);
    expect(page.data).toHaveLength(Math.min(2, total));
    expect(page.total).toBe(total);
  });

  test("getLogsPaginated next is null on last page", async () => {
    const { engine, profile } = makeEngine();
    const task = await engine.runQuery(profile.name, "", defaultQueryOptions);
    const state = engine.getTaskState(task.id);
    await state.finishedQuerying.wait();

    const total = state.eventsResultRowCount;
    const page = await engine.getLogsPaginated(task.id, 0, total + 100);
    expect(page.next).toBeNull();
  });

  test("getLogsPaginated prev is null on first page", async () => {
    const { engine, profile } = makeEngine();
    const task = await engine.runQuery(profile.name, "", defaultQueryOptions);
    const state = engine.getTaskState(task.id);
    await state.finishedQuerying.wait();

    const page = await engine.getLogsPaginated(task.id, 0, 2);
    expect(page.prev).toBeNull();
  });

  test("getLogsPaginated on unknown task throws", async () => {
    const { engine } = makeEngine();
    await expect(() =>
      engine.getLogsPaginated("no-such" as TaskRef, 0, 10),
    ).rejects.toThrow();
  });
});

// ─── Pipeline integration ─────────────────────────────────────────────────────

describe("pipeline integration", () => {
  test("query with eval pipeline adds computed field to every row", async () => {
    const { engine, profile } = makeEngine();
    // `| eval computed=1` — add a literal-number field to all rows
    const task = await engine.runQuery(
      profile.name,
      "| eval computed=1",
      defaultQueryOptions,
    );
    const state = engine.getTaskState(task.id);
    await state.finishedQuerying.wait();

    expect(state.task.status).toBe("completed");
    const result = await engine.getLogsPaginated(task.id, 0, 100000);
    expect(result.data.length).toBeGreaterThan(0);
    result.data.forEach((row) => {
      expect(row.object["computed"]).toEqual({ type: "number", value: 1 });
    });
  });

  test("query with stats pipeline produces table output", async () => {
    const { engine, profile } = makeEngine();
    const task = await engine.runQuery(
      profile.name,
      "| stats count",
      defaultQueryOptions,
    );
    const state = engine.getTaskState(task.id);
    await state.finishedQuerying.wait();

    expect(state.task.status).toBe("completed");
    expect(state.tableResultPath).toBeDefined();
    const tableResult = await engine.getTableDataPaginated(task.id, 0, 10);
    expect(tableResult.data).toHaveLength(1);
    expect(tableResult.data[0].object["count"]).toBeDefined();
  });

  test("stats grouped by field followed by sort uses direct column ref", async () => {
    const { engine, profile } = makeEngine();
    const task = await engine.runQuery(
      profile.name,
      "| stats count() by message | sort count desc",
      defaultQueryOptions,
    );
    const state = engine.getTaskState(task.id);
    await state.finishedQuerying.wait();

    expect(state.task.status).toBe("completed");
    expect(state.tableResultPath).toBeDefined();
    const tableResult = await engine.getTableDataPaginated(task.id, 0, 1000);
    expect(tableResult.data.length).toBeGreaterThan(0);
  });

  test("query with where pipeline filters rows", async () => {
    const { engine, profile } = makeEngine();
    // First run without filter to get total
    const taskAll = await engine.runQuery(
      profile.name,
      "",
      defaultQueryOptions,
    );
    const stateAll = engine.getTaskState(taskAll.id);
    await stateAll.finishedQuerying.wait();
    const totalRows = stateAll.eventsResultRowCount;

    // Run with a filter that matches nothing
    const taskFiltered = await engine.runQuery(
      profile.name,
      '| where _source == "no_such_source"',
      { ...defaultQueryOptions, isForced: true },
    );
    const stateFiltered = engine.getTaskState(taskFiltered.id);
    await stateFiltered.finishedQuerying.wait();

    expect(stateFiltered.task.status).toBe("completed");
    expect(stateFiltered.eventsResultRowCount).toBeLessThan(totalRows);
  });
});

// ─── Orphan recovery ──────────────────────────────────────────────────────────

describe("orphan recovery", () => {
  test("no spurious entries when no orphans exist", async () => {
    const { engine, profile } = makeEngine();
    const task = await engine.runQuery(profile.name, "", defaultQueryOptions);
    const state = engine.getTaskState(task.id);
    await state.finishedQuerying.wait();

    await engine.recoverInterruptedSessions();

    const history = engine.getQueryHistory(100, 0);
    const recoveryEntries = history.entries.filter((e) =>
      e.searchTerm === "[Recovered orphaned data]",
    );
    expect(recoveryEntries).toHaveLength(0);
  });

  test("subtask_history row with no query_history parent surfaces as interrupted entry", async () => {
    const { engine } = makeEngine();

    // Manually insert an orphaned subtask row (no parent query_history entry)
    engine["stateDB"].upsertSubtask({
      id: "orphan-subtask-1",
      dedupKey: "orphan-key-1",
      dataDir: "v1/orphan-subtask-1",
      adapterLock: { instanceRef: "test", pluginRef: "unknown", version: "unknown" },
      searchTerm: "orphan query",
      searchProfile: "test",
      fromTime: null,
      toTime: null,
      status: "running",
      createdAt: Date.now(),
      rowCount: null,
      diskBytes: null,
      fromDedup: false,
    });

    await engine.recoverInterruptedSessions();

    const history = engine.getQueryHistory(100, 0);
    const recoveryEntries = history.entries.filter((e) =>
      e.searchTerm === "[Recovered orphaned data]",
    );
    expect(recoveryEntries).toHaveLength(1);
    expect(recoveryEntries[0]!.status).toBe("interrupted");
    expect(recoveryEntries[0]!.subtaskIds).toContain("orphan-subtask-1");
  });

  test("disk-only directory with no subtask_history row surfaces as interrupted entry", async () => {
    const { engine } = makeEngine();

    // Manually create a v1/ directory on disk with no DB row
    const v1Dir = path.join(engine["sessionsDir"], "v1", "disk-orphan-dir");
    fs.mkdirSync(v1Dir, { recursive: true });

    await engine.recoverInterruptedSessions();

    const history = engine.getQueryHistory(100, 0);
    const recoveryEntries = history.entries.filter((e) =>
      e.searchTerm === "[Recovered orphaned data]",
    );
    expect(recoveryEntries).toHaveLength(1);
    expect(recoveryEntries[0]!.status).toBe("interrupted");
  });

  test("idempotency: second recoverInterruptedSessions does not create duplicate entry", async () => {
    const { engine } = makeEngine();

    engine["stateDB"].upsertSubtask({
      id: "orphan-subtask-idem",
      dedupKey: "orphan-key-idem",
      dataDir: "v1/orphan-subtask-idem",
      adapterLock: { instanceRef: "test", pluginRef: "unknown", version: "unknown" },
      searchTerm: "orphan query",
      searchProfile: "test",
      fromTime: null,
      toTime: null,
      status: "running",
      createdAt: Date.now(),
      rowCount: null,
      diskBytes: null,
      fromDedup: false,
    });

    await engine.recoverInterruptedSessions();
    await engine.recoverInterruptedSessions();

    const history = engine.getQueryHistory(100, 0);
    const recoveryEntries = history.entries.filter((e) =>
      e.searchTerm === "[Recovered orphaned data]",
    );
    expect(recoveryEntries).toHaveLength(1);
  });
});

// ─── Export ───────────────────────────────────────────────────────────────────

describe("export", () => {
  test("exportTableResults throws when no table data exists", async () => {
    const { engine, profile } = makeEngine();
    const task = await engine.runQuery(profile.name, "", defaultQueryOptions);
    const state = engine.getTaskState(task.id);
    await state.finishedQuerying.wait();
    await expect(engine.exportTableResults(task.id, "csv")).rejects.toThrow();
  });

  test("exportTableResults returns CSV after stats pipeline", async () => {
    const { engine, profile } = makeEngine();
    const task = await engine.runQuery(
      profile.name,
      "| stats count",
      defaultQueryOptions,
    );
    const state = engine.getTaskState(task.id);
    await state.finishedQuerying.wait();

    const result = await engine.exportTableResults(task.id, "csv");
    expect(result.contentType).toBe("text/csv");
    expect(result.payload).toContain("count");
  });

  test("exportTableResults returns JSON after stats pipeline", async () => {
    const { engine, profile } = makeEngine();
    const task = await engine.runQuery(
      profile.name,
      "| stats count",
      defaultQueryOptions,
    );
    const state = engine.getTaskState(task.id);
    await state.finishedQuerying.wait();

    const result = await engine.exportTableResults(task.id, "json");
    expect(result.contentType).toBe("application/json");
    const parsed = JSON.parse(result.payload);
    expect(Array.isArray(parsed)).toBe(true);
  });
});
