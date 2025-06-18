import { sub } from "date-fns";
import { expect, test } from "vitest";
import * as mockedData from "~adapters/mocked_data";
import { ExternalAuthProvider } from "~lib/adapters";
import { Engine } from "./engine";
import { InstanceRef, SearchProfileRef } from "./types";

test("engine register plugin", () => {
  const externalAuthProvider = {
    getCookies: () => Promise.resolve({}),
  } satisfies ExternalAuthProvider;

  const engine = new Engine(externalAuthProvider);
  engine.registerPlugin(mockedData.adapter);

  expect(engine.getSupportedPlugins().length).toBe(1);
  expect(engine.getSupportedPlugins()[0].ref).toBe("mocked_data");
});

test("engine initialize plugin", () => {
  const externalAuthProvider = {
    getCookies: () => Promise.resolve({}),
  } satisfies ExternalAuthProvider;

  const engine = new Engine(externalAuthProvider);
  engine.registerPlugin(mockedData.adapter);

  const plugins = engine.getSupportedPlugins();
  expect(plugins.length).toBe(1);

  const pluginToInitialize = plugins[0];

  const pluginInstance = engine.initializePlugin(
    pluginToInitialize.ref,
    "newInstance" as InstanceRef,
    {}
  );

  expect(pluginInstance).toBeDefined();
  expect(pluginInstance.pluginRef).toBe("mocked_data");
});

test("engine initialize profile", () => {
  const externalAuthProvider = {
    getCookies: () => Promise.resolve({}),
  } satisfies ExternalAuthProvider;

  const engine = new Engine(externalAuthProvider);
  engine.registerPlugin(mockedData.adapter);

  const plugins = engine.getSupportedPlugins();
  expect(plugins.length).toBe(1);

  const pluginToInitialize = plugins[0];
  const pluginInstance = engine.initializePlugin(
    pluginToInitialize.ref,
    "newInstance" as InstanceRef,
    {}
  );
  const profile = engine.initializeSearchProfile(
    "default" as SearchProfileRef,
    [pluginInstance.name]
  );

  expect(profile).toBeDefined();
  expect(profile.name).toBe("default");
});

test("engine query", async () => {
  const externalAuthProvider = {
    getCookies: () => Promise.resolve({}),
  } satisfies ExternalAuthProvider;

  const engine = new Engine(externalAuthProvider);
  engine.registerPlugin(mockedData.adapter);

  const plugins = engine.getSupportedPlugins();
  expect(plugins.length).toBe(1);

  const pluginToInitialize = plugins[0];
  const pluginInstance = engine.initializePlugin(
    pluginToInitialize.ref,
    "newInstance" as InstanceRef,
    {}
  );
  const searchProfile = "default" as SearchProfileRef;
  const profile = engine.initializeSearchProfile(searchProfile, [
    pluginInstance.name,
  ]);

  const task = await engine.runQuery(profile.name, "", {
    // empty search term to match all data
    fromTime: sub(new Date(), { days: 1 }).getTime(),
    toTime: new Date().getTime(),
    limit: 100000,
    isForced: false,
  });

  expect(task).toBeDefined();

  const state = engine.getTaskState(task.id);
  expect(state).toBeDefined();

  await state.finishedQuerying.wait();
  expect(state.task.status).toBe("completed");
  // expect(messages.length).toBe(3);
  // expect(messages[0].type).toBe("query_batch_done");
  // expect(messages[0].payload.jobId).toBe(task.id);
  // expect(messages[1].type).toBe("query_batch_done");
  // expect(messages[1].payload.jobId).toBe(task.id);
  // expect(messages[2].type).toBe("query_job_updated");
  // expect(messages[2].payload.jobId).toBe(task.id);
  // expect(messages[2].payload.status).toBe("completed");
});
