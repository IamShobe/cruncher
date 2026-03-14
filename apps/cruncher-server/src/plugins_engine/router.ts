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
  writeLocalConfig,
  readMergedConfig,
} from "./config";
import {
  CruncherConfig,
  DEFAULT_MAX_HISTORY_ENTRIES,
  DEFAULT_THEME,
  LIVE_INTERVAL_OPTIONS,
  TIMEZONE_OPTIONS,
} from "@cruncher/server-shared";
import { QueryBatchDone, QueryJobUpdated, UrlNavigation } from "./protocolOut";
import { publicProcedure, router } from "./trpc";

function getUiDefaults(config: CruncherConfig) {
  return {
    theme: config.ui?.theme ?? DEFAULT_THEME,
    liveInterval: config.ui?.liveInterval ?? "5s",
    maxLogs: config.ui?.maxLogs ?? 100000,
    liveAutoStopMinutes: config.ui?.liveAutoStopMinutes ?? 30,
    timezone: config.ui?.timezone ?? "local",
    maxHistoryEntries: config.ui?.maxHistoryEntries ?? DEFAULT_MAX_HISTORY_ENTRIES,
    keybindings: config.ui?.keybindings ?? {},
  };
}

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
    const { merged, globalConfig, localConfig, error } =
      readMergedConfig(appGeneralSettings);
    return {
      ...appGeneralSettings,
      theme: merged.ui.theme,
      liveInterval: merged.ui.liveInterval,
      maxLogs: merged.ui.maxLogs,
      liveAutoStopMinutes: merged.ui.liveAutoStopMinutes,
      timezone: merged.ui.timezone,
      maxHistoryEntries: merged.ui.maxHistoryEntries,
      keybindings: merged.ui.keybindings,
      globalKeybindings: globalConfig.ui?.keybindings ?? {},
      localKeybindings: localConfig.ui?.keybindings ?? {},
      configError: error,
    };
  }),
  setKeybinding: publicProcedure
    .input(
      z.object({
        shortcut: z.string(),
        Mac: z.string(),
        Windows: z.string(),
        target: z.enum(["global", "local"]),
      }),
    )
    .mutation(async ({ input }) => {
      const write =
        input.target === "global"
          ? writeConfig.bind(null, appGeneralSettings)
          : writeLocalConfig;
      write((config) => ({
        ...config,
        ui: {
          ...getUiDefaults(config),
          keybindings: {
            ...config.ui?.keybindings,
            [input.shortcut]: { Mac: input.Mac, Windows: input.Windows },
          },
        },
      }));
      return { success: true };
    }),
  resetKeybinding: publicProcedure
    .input(z.object({ shortcut: z.string() }))
    .mutation(async ({ input }) => {
      const removeFromConfig = (config: CruncherConfig): CruncherConfig => {
        const keybindings = { ...config.ui?.keybindings };
        delete keybindings[input.shortcut];
        return {
          ...config,
          ui: {
            ...getUiDefaults(config),
            keybindings,
          },
        };
      };
      writeConfig(appGeneralSettings, removeFromConfig);
      writeLocalConfig(removeFromConfig);
      return { success: true };
    }),
  resetAllKeybindings: publicProcedure.mutation(async () => {
    const clearKeybindings = (config: CruncherConfig): CruncherConfig => ({
      ...config,
      ui: {
        ...getUiDefaults(config),
        keybindings: {},
      },
    });
    writeConfig(appGeneralSettings, clearKeybindings);
    writeLocalConfig(clearKeybindings);
    return { success: true };
  }),
  setGeneralSettings: publicProcedure
    .input(
      z.object({
        liveInterval: z.enum(LIVE_INTERVAL_OPTIONS),
        maxLogs: z.number(),
        liveAutoStopMinutes: z.number().nullable(),
        timezone: z.enum(TIMEZONE_OPTIONS),
        maxHistoryEntries: z.number().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      writeConfig(appGeneralSettings, (config) => ({
        ...config,
        ui: {
          theme: config.ui?.theme ?? DEFAULT_THEME,
          keybindings: config.ui?.keybindings ?? {},
          ...config.ui,
          liveInterval: input.liveInterval,
          maxLogs: input.maxLogs,
          liveAutoStopMinutes: input.liveAutoStopMinutes,
          timezone: input.timezone,
          maxHistoryEntries: input.maxHistoryEntries,
        },
      }));
      ctx.engine.setMaxHistoryEntries(input.maxHistoryEntries);
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
        ui: {
          ...getUiDefaults(config),
          theme: input.theme,
        },
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.engine.appendQuery(
        input.jobId as TaskRef,
        new Date(input.fromTime),
        new Date(input.toTime),
      );
    }),

  // Session manager
  listSessions: publicProcedure.query(({ ctx }) => {
    return ctx.engine.listSessions();
  }),
  deleteSession: publicProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.engine.deleteSession(input.taskId as TaskRef);
      return { success: true };
    }),
  restoreSession: publicProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.engine.restoreSession(input.taskId as TaskRef);
    }),

  // Engine status & history
  getLoadedTaskIds: publicProcedure.query(({ ctx }) => {
    return ctx.engine.getLoadedTaskIds();
  }),
  getEngineStatus: publicProcedure.query(({ ctx }) => {
    return ctx.engine.getEngineStatus();
  }),
  getQueryHistory: publicProcedure
    .input(
      z.object({
        limit: z.number(),
        offset: z.number(),
        search: z.string().optional(),
        sortBy: z.enum(["createdAt", "completedAt", "diskBytes", "rowCount", "status"]).optional(),
        sortDir: z.enum(["asc", "desc"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.engine.getQueryHistory(input.limit, input.offset, input.search, input.sortBy, input.sortDir);
    }),
  deleteHistoryEntry: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.engine.deleteHistoryEntry(input.id);
      return { success: true };
    }),
  clearQueryHistory: publicProcedure.mutation(async ({ ctx }) => {
    await ctx.engine.clearQueryHistory();
    return { success: true };
  }),
  getSubtasksWithChunks: publicProcedure
    .input(z.object({ subtaskIds: z.array(z.string()) }))
    .query(async ({ ctx, input }) => {
      return ctx.engine.getSubtasksWithChunks(input.subtaskIds);
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

  navigateToUrl: publicProcedure
    .input(z.object({ url: z.string() }))
    .mutation(({ ctx, input }) => {
      ctx.eventEmitter.emit("urlNavigation", input.url);
      return { success: true };
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
