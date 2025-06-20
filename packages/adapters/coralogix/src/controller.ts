import {
  AdapterContext,
  QueryOptions,
  QueryProvider,
} from "@cruncher/adapter-utils";
import { ControllerIndexParam, Search } from "@cruncher/qql/grammar";
import type { CoralogixParams } from ".";
import {
  ProcessedData,
  ObjectFields,
  processField,
} from "@cruncher/adapter-utils/logTypes";
import {
  buildSearchTreeCallback,
  SearchTreeBuilder,
} from "@cruncher/qql/searchTree";
import { Mutex } from "async-mutex";

// request mutex to prevent multiple requests at the same time
const mutex = new Mutex();

type RequestInitModified = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

export class CoralogixController implements QueryProvider {
  private cookies: {
    teamCookie: string;
    tokenCookie: string;
  } | null = null;

  constructor(
    private ctx: AdapterContext,
    private params: CoralogixParams,
  ) {}

  getControllerParams(): Promise<Record<string, string[]>> {
    // TODO: Optionally fetch available metadata fields from Coralogix API
    return Promise.resolve({});
  }

  async query(
    controllerParams: ControllerIndexParam[],
    searchTerm: Search,
    queryOptions: QueryOptions,
  ): Promise<void> {
    // Build Lucene query string from searchTerm and controllerParams
    const luceneQuery = this.buildLuceneQuery(controllerParams, searchTerm);
    const { fromTime, toTime, limit, cancelToken, onBatchDone } = queryOptions;
    const pageSize = 1000;
    let pageIndex = 0;
    const nowDate = Date.now();
    let hasMore = true;
    let processedCount = 0;

    while (hasMore) {
      const payload = this.buildRequestPayload(
        luceneQuery,
        fromTime,
        toTime,
        pageSize,
        pageIndex,
        nowDate,
      );

      const response = await this._fetchWrapper(
        `${this.params.api_url}/logquery`,
        {
          method: "POST",
          body: JSON.stringify(payload),
          signal: cancelToken,
        },
      );
      if (!response.ok)
        throw new Error(
          `Coralogix query failed: ${response.status} ${response.statusText}`,
        );
      const data: CoralogixResponse = await response.json();
      const logs = this.processCoralogixResponse(data);
      processedCount += logs.length;
      onBatchDone(logs);
      if (
        processedCount >= data.total ||
        logs.length < pageSize ||
        processedCount >= limit
      ) {
        hasMore = false; // No more data to fetch
      }
      pageIndex++;
    }
  }

  private buildLuceneQuery(
    controllerParams: ControllerIndexParam[],
    searchTerm: Search,
  ): string {
    // Compose Lucene query from controllerParams and searchTerm
    const paramParts = controllerParams.map((param) => {
      if (param.operator === "=") {
        return `${param.name}:\"${param.value.type === "regex" ? param.value.pattern : param.value}\"`;
      } else if (param.operator === "!=") {
        return `NOT ${param.name}:\"${param.value.type === "regex" ? param.value.pattern : param.value}\"`;
      }
      return "";
    });
    // Use buildSearchTreeCallback to build the search pattern
    const searchText = this.buildSearchPattern(searchTerm);
    return [...paramParts, searchText].filter(Boolean).join(" AND ");
  }

  private _fetchWrapper = async (
    url: string,
    options: RequestInitModified = {},
    retryAmount: number = 0,
  ): ReturnType<typeof fetch> => {
    if (retryAmount > 2) {
      throw new Error("Failed to authenticate after multiple attempts");
    }
    const tokenCookieName = `${this.params.region}.coralogix_token`;
    const teamCookieName = `coralogix_t_id`;

    await mutex.runExclusive(async () => {
      // check if we dont have cookies or they are expired
      if (!this.cookies) {
        console.warn("Session expired, re-authenticating...");

        // re-authenticate
        const response = await this.ctx.externalAuthProvider.getCookies(
          this.params.dashboard_url,
          [tokenCookieName, teamCookieName],
          checkValidCookies(this.params.region),
        );

        this.cookies = {
          tokenCookie: response[tokenCookieName],
          teamCookie: response[teamCookieName],
        };
      }

      const headers = options.headers || {};
      const existingCookie = headers["Cookie"] || "";
      if (this.cookies) {
        let cookieString = existingCookie;
        if (this.cookies.tokenCookie && this.cookies.teamCookie) {
          cookieString += `;${tokenCookieName}=${this.cookies.tokenCookie};${teamCookieName}=${this.cookies.teamCookie}`;
        }
        headers["Cookie"] = cookieString;
        headers["CGX-Team-Id"] = this.cookies.teamCookie || "";
        headers["Content-Type"] = "application/json";
        options.headers = headers;
      }
    });

    const response = await fetch(url, options);
    if (response.status === 401) {
      console.warn("Authentication failed, trying to re-authenticate...");
      await mutex.runExclusive(async () => {
        this.cookies = null; // reset cookies to force re-authentication
      });
      // retry the request once authenticated
      return this._fetchWrapper(url, options, retryAmount + 1);
    }

    return response;
  };

  // Use buildSearchTreeCallback to build Lucene search pattern from Search/SearchLiteral
  private buildSearchPattern(search: Search): string {
    // Define a builder for Lucene string
    const luceneBuilder: SearchTreeBuilder<string> = {
      buildAnd: (leftCallback, searchAnd) => (item: string) => {
        const left = leftCallback(item);
        const right = buildSearchTreeCallback(
          searchAnd.right,
          luceneBuilder,
        )(item);
        return [left, right].filter(Boolean).join(" AND ");
      },
      buildOr: (leftCallback, searchOr) => (item: string) => {
        const left = leftCallback(item);
        const right = buildSearchTreeCallback(
          searchOr.right,
          luceneBuilder,
        )(item);
        return [left, right].filter(Boolean).join(" OR ");
      },
      buildLiteral: (searchLiteral) => () => {
        if (!searchLiteral.tokens.length) return "";
        return searchLiteral.tokens
          .map((token) => `\"${String(token)}\"`)
          .join(" AND ");
      },
    };
    // Always pass a dummy string for item, since we only want the string
    return buildSearchTreeCallback(search, luceneBuilder)("");
  }

  private buildRequestPayload(
    luceneQuery: string,
    fromTime: Date,
    toTime: Date,
    pageSize: number,
    pageIndex: number,
    nowDate: number,
  ) {
    return {
      queryDef: {
        type: "freeText",
        pageSize,
        queryParams: {
          query: {
            text: luceneQuery,
            type: "exact",
            syntax: "Lucene",
            templateIds: [],
          },
          templateIds: [],
          metadata: {
            applicationName: [],
            subsystemName: [],
            operationName: [],
            serviceName: [],
            severity: [],
          },
          jsonObject: {},
          jsonAggFields: [],
          ts_agg: null,
          aggregationInterval: 15000,
          externalFilters: { teams: [], templateClassification: [] },
          selectedLogs: [],
          customParam: {},
          archiveFilterPath: {},
        },
        sortModel: [{ field: "timestamp", ordering: "desc", missing: "_last" }],
        graphs: [],
        gridOptions: null,
        legendSettings: null,
        layoutSettings: null,
        persistent: false,
        selectedQuerySyntax: "lucene",
        nowDate,
        cacheQueryId: "",
        shouldAggregateGeneralTemplates: true,
        endDate: toTime.getTime(),
        startDate: fromTime.getTime(),
        tagId: -1,
        selectedViewId: -1,
        pageIndex,
        selectedSurroundLog: { id: null, timestamp: null, limit: pageSize },
      },
    };
  }

  private processCoralogixResponse(data: CoralogixResponse): ProcessedData[] {
    if (!data || !data.logs) return [];
    return data.logs.map((log) => {
      const timestamp = log.timestamp || Date.now();
      const uniqueId = log.logId || log.jsonUuid || "";
      const message = log.text || "";
      const objectFields: ObjectFields = {
        _time: { type: "date", value: timestamp },
        _sortBy: { type: "number", value: timestamp },
        _uniqueId: { type: "string", value: uniqueId },
        _index: { type: "number", value: log.index || 0 },
        _logIndex: { type: "string", value: log.logIndex || "" },
        _jsonUuid: { type: "string", value: log.jsonUuid || "" },
        _raw: { type: "string", value: JSON.stringify(log) },
      };
      Object.entries(log).forEach(([key, value]) => {
        if (!(key in objectFields)) objectFields[key] = processField(value);
      });

      // try parse text
      try {
        const parsedText = JSON.parse(log.text);
        if (typeof parsedText === "object" && parsedText !== null) {
          Object.entries(parsedText).forEach(([key, value]) => {
            objectFields[key] = processField(value);
          });
        }
      } catch (e) {
        // If parsing fails, keep the original text
      }

      return { object: objectFields, message };
    });
  }
}

const checkValidCookies =
  (region: string) =>
  (cookies: Record<string, string>): Promise<boolean> => {
    const tokenCookieName = `${region}.coralogix_token`;
    const teamCookieName = `coralogix_t_id`;
    const tokenCookie = cookies[tokenCookieName];
    const teamCookie = cookies[teamCookieName];
    if (tokenCookie && teamCookie) {
      return Promise.resolve(true);
    }

    return Promise.resolve(false);
  };

type CoralogixLog = {
  timestamp: number;
  logId: string;
  jsonUuid: string;
  index: number;
  logIndex: string;
  text: string;
  [key: string]: any;
};

type CoralogixResponse = {
  logs: CoralogixLog[];
  total: number;
  page_index: number;
};
