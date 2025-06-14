import { DisplayResults } from "~lib/displayTypes";
import { AwaitableTask, QueryProvider } from "./common/interface";


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
  getClosestDateEvent(): Promise<number | null> {
    throw new Error("No query provider available - please configure ~/.config/cruncher/cruncher.config.yaml");
  }

  releaseResources(): Promise<void> {
    throw new Error("No query provider available - please configure ~/.config/cruncher/cruncher.config.yaml");
  }
}

export const DEFAULT_QUERY_PROVIDER = new DefaultQueryProvider();
