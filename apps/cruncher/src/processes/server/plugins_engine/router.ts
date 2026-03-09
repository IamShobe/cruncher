import { on } from "node:events";
import {
  InstanceRef,
  QueryTask,
  SearchProfileRef,
  TaskRef,
} from "../engineV2/types";
import z from "zod/v4";
import {
  appGeneralSettings,
  setupPluginsFromConfig,
  writeConfig,
  readConfig,
} from "./config";
import { LIVE_INTERVAL_OPTIONS, TIMEZONE_OPTIONS } from "../config/schema";
import { QueryBatchDone, QueryJobUpdated, UrlNavigation } from "./protocolOut";
import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  reloadConfig: publicProcedure.mutation(async ({ ctx }) => {
    setupPluginsFromConfig(appGeneralSettings, ctx.engine);
    return { success: true };
  }),
  resetQueries: publicProcedure.mutation(async ({ ctx }) => {
    await ctx.engine.resetQueries();
    return { success: true };
  }),
  getSupportedPlugins: publicProcedure.query(async ({ ctx }) => {
    return ctx.engine.getSupportedPlugins();
  }),
  getInitializedPlugins: publicProcedure.query(async ({ ctx }) => {
    return ctx.engine.getInitializedPlugins();
  }),
  getSearchProfiles: publicProcedure.query(async ({ ctx }) => {
    return ctx.engine.getSearchProfiles();
  }),
  runQueryV2: publicProcedure
    .input(
      z.object({
        searchProfileRef: z.string(),
        searchTerm: z.string(),
        queryOptions: z.object({
          fromTime: z.number(),
          toTime: z.number(),
          limit: z.number(),
          isForced: z.boolean(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.engine.runQuery(
        input.searchProfileRef as SearchProfileRef,
        input.searchTerm,
        input.queryOptions,
      );
    }),
  getControllerParams: publicProcedure
    .input(
      z.object({
        instanceRef: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.engine.getControllerParams(
        input.instanceRef as InstanceRef,
      );
    }),
  getParamValueSuggestions: publicProcedure
    .input(
      z.object({
        instanceRef: z.string(),
        field: z.string(),
        indexes: z.array(z.string()),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.engine.getParamValueSuggestions(
        input.instanceRef as InstanceRef,
        input.field,
        input.indexes,
      );
    }),
  cancelQuery: publicProcedure
    .input(
      z.object({
        taskId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      ctx.engine.cancelQuery(input.taskId as TaskRef);
      return { success: true };
    }),
  getLogs: publicProcedure
    .input(
      z.object({
        jobId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.engine.getLogs(input.jobId as TaskRef);
    }),
  getLogsPaginated: publicProcedure
    .input(
      z.object({
        jobId: z.string(),
        offset: z.number(),
        limit: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.engine.getLogsPaginated(
        input.jobId as TaskRef,
        input.offset,
        input.limit,
      );
    }),
  getTableDataPaginated: publicProcedure
    .input(
      z.object({
        jobId: z.string(),
        offset: z.number(),
        limit: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.engine.getTableDataPaginated(
        input.jobId as TaskRef,
        input.offset,
        input.limit,
      );
    }),
  getClosestDateEvent: publicProcedure
    .input(
      z.object({
        jobId: z.string(),
        refDate: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.engine.getClosestDateEvent(
        input.jobId as TaskRef,
        input.refDate,
      );
    }),
  releaseTaskResources: publicProcedure
    .input(
      z.object({
        jobId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.engine.releaseTaskResources(input.jobId as TaskRef);
      return { success: true };
    }),
  ping: publicProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      console.log(`Hello, ${input.name}!`);
    }),
  getGeneralSettings: publicProcedure.query(async () => {
    const { config, error } = readConfig(appGeneralSettings);
    return {
      ...appGeneralSettings,
      theme: config.ui?.theme ?? "midnight",
      liveInterval: config.ui?.liveInterval ?? "5s",
      maxLogs: config.ui?.maxLogs ?? 100000,
      liveAutoStopMinutes: config.ui?.liveAutoStopMinutes ?? 30,
      timezone: config.ui?.timezone ?? "local",
      configError: error,
    };
  }),
  setLiveSettings: publicProcedure
    .input(
      z.object({
        liveInterval: z.enum(LIVE_INTERVAL_OPTIONS),
        maxLogs: z.number(),
        liveAutoStopMinutes: z.number().nullable(),
        timezone: z.enum(TIMEZONE_OPTIONS),
      }),
    )
    .mutation(async ({ input }) => {
      writeConfig(appGeneralSettings, (config) => ({
        ...config,
        ui: {
          ...config.ui,
          liveInterval: input.liveInterval,
          maxLogs: input.maxLogs,
          liveAutoStopMinutes: input.liveAutoStopMinutes,
          timezone: input.timezone,
        },
      }));
      return { success: true };
    }),
  setTheme: publicProcedure
    .input(
      z.object({
        theme: z.enum(["midnight", "nord", "dracula", "catppuccin"]),
      }),
    )
    .mutation(async ({ input }) => {
      writeConfig(appGeneralSettings, (config) => ({
        ...config,
        ui: { ...config.ui, theme: input.theme },
      }));
      return { success: true };
    }),
  exportTableResults: publicProcedure
    .input(
      z.object({
        jobId: z.string(),
        format: z.enum(["csv", "json"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.engine.exportTableResults(
        input.jobId as TaskRef,
        input.format,
      );
    }),
  getViewData: publicProcedure
    .input(
      z.object({
        jobId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.engine.getViewData(input.jobId as TaskRef);
    }),

  appendQueryResults: publicProcedure
    .input(
      z.object({
        jobId: z.string(),
        fromTime: z.number(),
        toTime: z.number(),
        maxLogs: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.engine.appendQuery(
        input.jobId as TaskRef,
        new Date(input.fromTime),
        new Date(input.toTime),
        input.maxLogs,
      );
    }),

  // Subscriptions
  onJobBatchDone: publicProcedure
    .input(
      z.object({
        jobId: z.string(),
      }),
    )
    .subscription(async function* ({ ctx, input, signal }) {
      const jobId = input.jobId as TaskRef;
      for await (const update of ctx.engine.getJobUpdates(jobId, signal)) {
        yield newBatchDoneMessage(jobId, update);
      }
    }),
  onJobDone: publicProcedure
    .input(
      z.object({
        jobId: z.string(),
      }),
    )
    .subscription(async function* ({ ctx, input, signal }) {
      const jobId = input.jobId as TaskRef;
      for await (const update of ctx.engine.getJobDoneUpdates(jobId, signal)) {
        yield newJobUpdatedMessage(
          jobId,
          update.task.status,
          update.task.error,
        );
      }
    }),
  onUrlNavigation: publicProcedure.subscription(async function* ({
    ctx,
    signal,
  }) {
    for await (const [data] of on(ctx.eventEmitter, "urlNavigation", {
      signal,
    })) {
      yield newUrlNavigationMessage(data);
    }
  }),
});

export const newBatchDoneMessage = (
  jobId: string,
  data: unknown,
): QueryBatchDone => {
  return {
    type: "query_batch_done",
    payload: {
      jobId: jobId,
      data: data,
    },
  };
};

export const newJobUpdatedMessage = (
  jobId: string,
  status: QueryTask["status"],
  error?: string | null,
): QueryJobUpdated => {
  return {
    type: "query_job_updated",
    payload: {
      jobId: jobId,
      status: status,
      error: error ?? null,
    },
  };
};

export const newUrlNavigationMessage = (url: string): UrlNavigation => {
  return {
    type: "url_navigation",
    payload: {
      url: url,
    },
  };
};
