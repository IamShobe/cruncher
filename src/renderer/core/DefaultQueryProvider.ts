import { DisplayResults } from "~lib/displayTypes";
import { AwaitableTask, QueryProvider } from "./common/interface";
import { ClosestPoint, PageResponse } from "src/engineV2/engine";
import { ProcessedData } from "~lib/adapters/logTypes";


class DefaultQueryProvider implements QueryProvider {
  waitForReady(): Promise<void> {
    return Promise.resolve();
  }
  getControllerParams(): Promise<Record<string, string[]>> {
    throw new Error("No query provider available - please configure ~/.config/cruncher/cruncher.config.yaml");
  }
  query(): Promise<AwaitableTask> {
    throw new Error("No query provider available - please configure ~/.config/cruncher/cruncher.config.yaml");
  }

  getLogs(): Promise<DisplayResults> {
    throw new Error("No query provider available - please configure ~/.config/cruncher/cruncher.config.yaml");
  }

  getLogsPaginated(): Promise<PageResponse<ProcessedData>> {
    throw new Error("No query provider available - please configure ~/.config/cruncher/cruncher.config.yaml");
  }

  getClosestDateEvent(): Promise<ClosestPoint | null> {
    throw new Error("No query provider available - please configure ~/.config/cruncher/cruncher.config.yaml");
  }

  releaseResources(): Promise<void> {
    throw new Error("No query provider available - please configure ~/.config/cruncher/cruncher.config.yaml");
  }
}

export const DEFAULT_QUERY_PROVIDER = new DefaultQueryProvider();
