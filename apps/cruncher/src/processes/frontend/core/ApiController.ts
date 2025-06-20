import { TRPCClient } from "@trpc/client";
import { Unsubscribable } from "@trpc/server/observable";
import {
  ClosestPoint,
  ExportResults,
  InstanceRef,
  JobBatchFinished,
  PageResponse,
  SearchProfileRef,
  TableDataResponse,
  TaskRef,
} from "src/processes/server/engineV2/types";
import { AppRouter } from "src/processes/server/plugins_engine/router_messages";
import { ProcessedData } from "@cruncher/adapter-utils/logTypes";
import { DisplayResults } from "~lib/displayTypes";
import { removeJobQueries } from "./api";

export type QueryOptions = {
  fromTime: Date;
  toTime: Date;
  cancelToken: AbortSignal;
  limit: number;
  isForced: boolean;
  onBatchDone: (data: JobBatchFinished) => void;
};

export class ApiController {
  constructor(private connection: TRPCClient<AppRouter>) {}
  reload = async () => {
    return await this.connection.reloadConfig.mutate();
  };

  resetQueries = async () => {
    return await this.connection.resetQueries.mutate();
  };

  listPlugins = async () => {
    return await this.connection.getSupportedPlugins.query();
  };

  listInitializedPlugins = async () => {
    return await this.connection.getInitializedPlugins.query();
  };

  listInitializedSearchProfiles = async () => {
    return await this.connection.getSearchProfiles.query();
  };

  getGeneralSettings = async () => {
    return await this.connection.getGeneralSettings.query();
  };

  getControllerParams = async (
    pluginInstanceRef: InstanceRef,
  ): Promise<Record<string, string[]>> => {
    return await this.connection.getControllerParams.query({
      instanceRef: pluginInstanceRef,
    });
  };

  onUrlNavigation = (callback: (url: string) => void) => {
    return this.connection.onUrlNavigation.subscribe(undefined, {
      onData: (message) => {
        callback(message.payload.url);
      },
    });
  };

  async getViewData(
    taskId: TaskRef,
  ): Promise<NonNullable<DisplayResults["view"]>> {
    return await this.connection.getViewData.query({ jobId: taskId });
  }

  async getTableDataPaginated(
    taskId: TaskRef,
    offset: number,
    limit: number,
  ): Promise<TableDataResponse> {
    return await this.connection.getTableDataPaginated.query({
      jobId: taskId,
      offset: offset,
      limit: limit,
    });
  }

  async getLogsPaginated(
    taskId: TaskRef,
    offset: number,
    limit: number,
  ): Promise<PageResponse<ProcessedData>> {
    const results = await this.connection.getLogsPaginated.query({
      jobId: taskId,
      offset: offset,
      limit: limit,
    });

    return results;
  }

  async getClosestDateEvent(
    taskId: TaskRef,
    refDate: number,
  ): Promise<ClosestPoint | null> {
    const results = await this.connection.getClosestDateEvent.query({
      jobId: taskId,
      refDate: refDate,
    });

    if (results === null) {
      console.warn("No closest date event found");
      return null;
    }

    return results;
  }

  async exportTableResults(
    taskId: TaskRef,
    format: "csv" | "json",
  ): Promise<ExportResults> {
    return await this.connection.exportTableResults.mutate({
      jobId: taskId,
      format: format,
    });
  }

  async releaseResources(taskId: TaskRef): Promise<void> {
    await removeJobQueries(taskId);
    this.connection.releaseTaskResources.mutate({
      jobId: taskId,
    });
  }

  async query(
    searchProfileRef: SearchProfileRef,
    searchTerm: string,
    queryOptions: QueryOptions,
  ) {
    // setup cancel token
    const cancelToken = queryOptions.cancelToken;
    let unsubscribeJobDoneHandler: Unsubscribable;

    const executedJob = await this.connection.runQueryV2.mutate({
      searchProfileRef: searchProfileRef,
      searchTerm,
      queryOptions: {
        fromTime: queryOptions.fromTime.getTime(),
        toTime: queryOptions.toTime.getTime(),
        limit: queryOptions.limit,
        isForced: queryOptions.isForced || false, // Default to false if not provided
      },
    });

    cancelToken.addEventListener("abort", async () => {
      console.log(`Query job ${executedJob.id} cancelled`);
      await this.connection.cancelQuery.mutate({
        taskId: executedJob.id,
      });
    });

    const unsubscribeBatchHandler = this.connection.onJobBatchDone.subscribe(
      {
        jobId: executedJob.id,
      },
      {
        onData: (batchMessage) => {
          queryOptions.onBatchDone(batchMessage.payload.data);
        },
      },
    );

    console.log("Query job started:", executedJob);
    return {
      job: executedJob,
      promise: new Promise<void>((resolve, reject) => {
        unsubscribeJobDoneHandler = this.connection.onJobDone.subscribe(
          {
            jobId: executedJob.id,
          },
          {
            onData: (jobUpdateMessage) => {
              try {
                const jobUpdate = jobUpdateMessage.payload;
                if (jobUpdate.status === "completed") {
                  console.log(`Job ${jobUpdate.jobId} completed`);
                  resolve();
                } else if (
                  jobUpdate.status === "failed" ||
                  jobUpdate.status === "canceled"
                ) {
                  console.error(
                    `Job ${jobUpdate.jobId} failed with error: ${jobUpdate.error || "Unknown error"}`,
                  );
                  reject(
                    new Error(
                      `Query job ${jobUpdate.jobId} failed with status: ${jobUpdate.status}\nError: ${
                        jobUpdate.error || "Unknown error"
                      }`,
                    ),
                  );
                } else {
                  console.log(
                    `Job ${jobUpdate.jobId} updated: ${jobUpdate.status}`,
                  );
                }
              } catch (error) {
                reject(error);
              } finally {
                unsubscribeBatchHandler.unsubscribe();
                unsubscribeJobDoneHandler.unsubscribe();
              }
            },
          },
        );
      }),
    };
  }
}
