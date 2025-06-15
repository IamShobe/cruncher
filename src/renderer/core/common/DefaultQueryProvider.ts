import { ProcessedData } from "~lib/adapters/logTypes";
import { DisplayResults } from "~lib/displayTypes";
import { AwaitableTask, QueryOptions } from "./interface";
import { ClosestPoint, ExportResults, PageResponse, TableDataResponse, TaskRef } from "src/engineV2/types";


export class DefaultQueryProvider {
  waitForReady(): Promise<void> {
    return Promise.resolve();
  }
  private _defaultImplementation(): never {
    throw new Error("No query provider available - please configure ~/.config/cruncher/cruncher.config.yaml");
  }

  getControllerParams(): Promise<Record<string, string[]>> {
    return this._defaultImplementation();
  }

  query(searchTerm: string, queryOptions: QueryOptions): Promise<AwaitableTask> {
    return this._defaultImplementation();
  }

  getLogs(): Promise<DisplayResults> {
    return this._defaultImplementation();
  }

  getLogsPaginated(taskId: TaskRef, offset: number, limit: number): Promise<PageResponse<ProcessedData>> {
    return this._defaultImplementation();
  }

  getTableDataPaginated(taskId: TaskRef, offset: number, limit: number): Promise<TableDataResponse> {
    return this._defaultImplementation();
  }

  getClosestDateEvent(taskId: TaskRef, refDate: number): Promise<ClosestPoint | null> {
    return this._defaultImplementation();
  }

  releaseResources(taskId: TaskRef): Promise<void> {
    return this._defaultImplementation();
  }

  exportTableResults(taskId: TaskRef, format: "csv" | "json"): Promise<ExportResults> {
    return this._defaultImplementation();
  }

  getViewData(taskId: TaskRef): Promise<NonNullable<DisplayResults["view"]>> {
    return this._defaultImplementation();
  }
}

export const DEFAULT_QUERY_PROVIDER = new DefaultQueryProvider();
