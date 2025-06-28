import { ControllerIndexParam, Search } from "@cruncher/qql/grammar";
import { buildExpression, LokiLabelFilter } from "@cruncher/adapter-loki/query";

export const LIMIT = 5000;

export const buildQuery = (
  uid: string,
  baseFilter: LokiLabelFilter[],
  controllerParams: ControllerIndexParam[],
  search: Search,
  fromTime: Date,
  toTime: Date,
  filterExtensions?: string[],
) => {
  return {
    queries: [
      {
        refId: "A",
        expr: buildExpression(
          baseFilter,
          controllerParams,
          search,
          filterExtensions,
        ),
        queryType: "range",
        datasource: {
          type: "loki",
          uid: uid,
        },
        editorMode: "code",
        maxLines: LIMIT,
        step: "",
        legendFormat: "",
        datasourceId: 7,
        intervalMs: 60000,
        maxDataPoints: 1002,
      },
    ],
    from: fromTime.getTime().toString(),
    to: toTime.getTime().toString(),
  };
};
