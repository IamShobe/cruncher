import {
  AdapterContext,
  QueryOptions,
  QueryProvider,
} from "@cruncher/adapter-utils";
import { ControllerIndexParam, Search } from "@cruncher/qql/grammar";
import { Mutex } from "async-mutex";
import { z } from "zod/v4";
import type { DatadogParams } from ".";
import { getAppUrl } from ".";
import {
  buildDatadogQuery,
  buildRequestPayload,
  processDatadogResponse,
  DatadogLogsResponse,
  DatadogPaging,
} from "./query";

// ---------------------------------------------------------------------------
// Response schemas for getControllerParams
// ---------------------------------------------------------------------------

const IndexesResponseSchema = z.object({
  indexes: z.array(z.object({ name: z.string() })).optional(),
});

const FacetValueSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
});

const FacetEntrySchema = z.object({
  path: z.string().optional(),
  name: z.string().optional(),
  values: z.array(FacetValueSchema).optional(),
});

const FacetsResponseSchema = z.object({
  facets: z.record(z.string(), z.array(FacetEntrySchema)).optional(),
});

// aggregate endpoint response: { result: { buckets: [{ by: { "<facetPath>": "<value>" } }] } }
const AggregateBucketSchema = z.object({
  by: z.record(z.string(), z.string()).optional(),
  // facet_info-style response: top-level value string
  value: z.string().optional(),
});

export const AggregateResponseSchema = z.object({
  result: z
    .object({
      buckets: z.array(AggregateBucketSchema).optional(),
    })
    .optional(),
});

export const SuggestionsResponseSchema = z.object({
  data: z
    .object({
      attributes: z
        .object({
          suggestions: z
            .array(z.object({ text: z.string().optional() }))
            .optional(),
        })
        .optional(),
    })
    .optional(),
});

// ---------------------------------------------------------------------------
// CSRF interception
// ---------------------------------------------------------------------------

// Key used in the cookies dict to carry the CSRF token extracted from the page.
const CSRF_KEY = "__dd_csrf__";

// JS snippet injected into the auth window to capture the CSRF token from
// Datadog's own outgoing requests.  It is idempotent (safe to run on every
// navigation) and works with both fetch and XMLHttpRequest.
//
// runOnNavigation:true → auth.ts runs this on every did-frame-navigate so
//   interceptors are in place before the SPA fires its initial API calls.
// waitForResult:true   → auth.ts polls every 300 ms (up to 10 s) until a
//   truthy value is returned.
const CSRF_JS = `
  (function() {
    if (window.__capturedCsrf) return window.__capturedCsrf;

    if (!window.__csrfInterceptorInstalled) {
      window.__csrfInterceptorInstalled = true;

      var _fetch = window.fetch;
      window.fetch = function(input, init) {
        try {
          var h = init && init.headers;
          if (h) {
            var v = (h instanceof Headers)
              ? (h.get('x-csrf-token') || h.get('X-CSRF-Token'))
              : (h['x-csrf-token'] || h['X-Csrf-Token'] || h['X-CSRF-Token']);
            if (v) window.__capturedCsrf = v;
          }
        } catch(e) {}
        return _fetch.apply(this, arguments);
      };

      var _setHeader = XMLHttpRequest.prototype.setRequestHeader;
      XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
        if (name && name.toLowerCase() === 'x-csrf-token' && value)
          window.__capturedCsrf = value;
        return _setHeader.apply(this, arguments);
      };
    }

    return window.__capturedCsrf || '';
  })()
`.trim();

// ---------------------------------------------------------------------------
// Controller
// ---------------------------------------------------------------------------

// The primary session cookie set by Datadog after a successful SSO login.
const SESSION_COOKIE = "dogweb";

// Module-level mutex ensures only one auth window opens at a time across all
// controller instances (e.g. if multiple queries are fired concurrently).
const mutex = new Mutex();

type RequestInitModified = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

type SessionState = {
  all: Record<string, string>; // all session cookies
  csrf: string; // CSRF token captured from the page
};

export class DatadogController implements QueryProvider {
  private session: SessionState | null = null;

  constructor(
    private ctx: AdapterContext,
    private params: DatadogParams,
  ) {}

  async getControllerParams(): Promise<Record<string, string[]>> {
    const appUrl = getAppUrl(this.params.site);
    const result: Record<string, string[]> = {};

    // Phase 1: fetch index names and facet metadata (path + pre-defined values).
    // Facets with bounded enum values (e.g. "status") are fully resolved here.
    // Facets with dynamic values (e.g. "kube_namespace") get an empty array for
    // now — phase 2 will fill them in via aggregate queries.
    const dynamicFacetPaths: string[] = [];

    await Promise.all([
      // Fetch available log index names.
      this._fetchWrapper(`${appUrl}/api/v1/logs/indexes`)
        .then(async (r) => {
          if (!r.ok) return;
          const parsed = IndexesResponseSchema.safeParse(await r.json());
          if (!parsed.success) return;
          const names = (parsed.data.indexes ?? [])
            .map((i) => i.name)
            .filter(Boolean);
          if (names.length) result.index = names;
        })
        .catch(() => {}),

      // Fetch configured log facets.
      // Response shape: { facets: { [category]: FacetEntry[] } }
      this._fetchWrapper(
        `${appUrl}/api/ui/event-platform/logs/facets?type=logs`,
      )
        .then(async (r) => {
          if (!r.ok) return;
          const parsed = FacetsResponseSchema.safeParse(await r.json());
          if (!parsed.success) return;
          for (const category of Object.values(parsed.data.facets ?? {})) {
            for (const facet of category) {
              const key = facet.path ?? facet.name;
              if (!key || key in result) continue;
              const predefined = (facet.values ?? [])
                .map((v) => v.id ?? v.name ?? "")
                .filter(Boolean);
              result[key] = predefined;
              if (predefined.length === 0) dynamicFacetPaths.push(key);
            }
          }
        })
        .catch(() => {}),
    ]);

    // Phase 2: for facets with no pre-defined values, query the aggregate
    // endpoint to surface the most common values from recent logs.
    let csrf: string;
    try {
      csrf = await this.getCsrf();
    } catch (error) {
      console.warn("[datadog] getControllerParams: skipping Phase 2 (CSRF unavailable):", error);
      for (const [key, values] of Object.entries(result)) {
        if (key !== "index" && values.length === 0) delete result[key];
      }
      return result;
    }
    await Promise.all(
      dynamicFacetPaths.map((path) =>
        this._fetchFacetTopValues(appUrl, path, csrf)
          .then((values) => {
            if (values.length) result[path] = values;
          })
          .catch(() => {}),
      ),
    );

    // Drop facets that ended up with no values (empty ghosts confuse the UI).
    for (const [key, values] of Object.entries(result)) {
      if (key !== "index" && values.length === 0) delete result[key];
    }

    return result;
  }

  // Queries the aggregate endpoint for the top-N most frequent values of a
  // single facet over the last 15 minutes.  Returns [] on any failure.
  private async _fetchFacetTopValues(
    appUrl: string,
    facetPath: string,
    csrfToken: string,
  ): Promise<string[]> {
    const indexes = this.params.indexes?.length ? this.params.indexes : ["*"];

    const response = await this._fetchWrapper(
      `${appUrl}/api/v1/logs-analytics/facet_info?type=logs`,
      {
        method: "POST",
        body: JSON.stringify({
          facet_info: {
            metric: "count",
            limit: 50,
            indexes,
            time: { from: "now-900s", to: "now" },
            aggregation: "count",
            search: { query: "" },
            termSearch: { query: "" },
            executionInfo: {},
            calculatedFields: [],
            extractions: [],
            path: facetPath,
          },
          _authentication_token: csrfToken,
        }),
      },
    );

    if (!response.ok) {
      console.error(
        `[datadog] facet_info for ${facetPath} returned ${response.status}`,
      );
      return [];
    }

    const raw = (await response.json()) as unknown;
    const parsed = AggregateResponseSchema.safeParse(raw);
    if (!parsed.success) return [];

    return (parsed.data.result?.buckets ?? [])
      .map((b) => b.by?.[facetPath] ?? b.value ?? "")
      .filter(Boolean);
  }

  async getDynamicSuggestions(
    field: string,
    indexes: string[],
  ): Promise<string[]> {
    try {
      const appUrl = getAppUrl(this.params.site);
      const csrf = await this.getCsrf();
      const effectiveIndexes = indexes.length
        ? indexes
        : (this.params.indexes ?? ["*"]);

      const response = await this._fetchWrapper(
        `${appUrl}/api/ui/search/suggestions/logs`,
        {
          method: "POST",
          body: JSON.stringify({
            data: {
              type: "query_autocomplete_request",
              attributes: {
                query_tokens: [`${field}:`],
                raw_query: `${field}: `,
                start_index: 0,
                end_index: 0,
                limit: 10,
                product: "logs",
                context: "unified-explorer",
                id: crypto.randomUUID(),
                suggestion_groups: ["facet_value"],
                triggerContext: {
                  type: "field_value",
                  text: "",
                  field,
                  previousValues: [],
                  indexes: effectiveIndexes,
                  filter: `${field}:*`,
                  cacheableQuery: `${field}:*`,
                },
                userContext: { recentSearches: [] },
              },
            },
            _authentication_token: csrf,
          }),
        },
      );

      if (!response.ok) {
        console.error(
          `[datadog] getDynamicSuggestions for field="${field}" returned ${response.status}`,
        );
        return [];
      }

      const raw = (await response.json()) as unknown;
      const parsed = SuggestionsResponseSchema.safeParse(raw);
      if (!parsed.success) {
        console.error(
          `[datadog] getDynamicSuggestions response parse failed for field="${field}":`,
          parsed.error,
        );
        return [];
      }

      return (parsed.data.data?.attributes?.suggestions ?? [])
        .map((s) => s.text ?? "")
        .filter(Boolean);
    } catch (error) {
      console.error(`[datadog] getDynamicSuggestions: auth failed for "${field}":`, error);
      return [];
    }
  }

  async query(
    controllerParams: ControllerIndexParam[],
    searchTerm: Search,
    queryOptions: QueryOptions,
  ): Promise<void> {
    const { fromTime, toTime, limit, cancelToken, onBatchDone } = queryOptions;
    const apiUrl = `${getAppUrl(this.params.site)}/api/v1/logs-analytics/list?type=logs`;

    // Extract `index` params and route them to the payload's `indexes` field.
    // All other params are serialized into the Lucene query string.
    const indexValues = controllerParams
      .filter((p) => p.name === "index" && p.operator === "=")
      .map((p) => (p.value.type === "regex" ? p.value.pattern : p.value.value));
    const otherParams = controllerParams.filter((p) => p.name !== "index");

    const luceneQuery = buildDatadogQuery(
      otherParams,
      searchTerm,
      this.params.query_prefix,
    );

    // User-specified indexes override the profile-level defaults.
    const indexes = indexValues.length > 0 ? indexValues : this.params.indexes;

    let cursor: DatadogPaging | undefined = undefined;
    let totalProcessed = 0;
    let pageNum = 0;

    while (true) {
      if (cancelToken.aborted) break;

      // Throttle with jitter between pages to avoid bot detection.
      if (pageNum > 0) {
        const jitterMs = 300 + Math.random() * 400; // 300–700 ms
        await new Promise((resolve) => setTimeout(resolve, jitterMs));
        if (cancelToken.aborted) break;
      }
      pageNum++;

      const pageLimit = Math.min(1000, limit - totalProcessed);
      // Ensure session is established before building the payload so the CSRF
      // token is always fresh (getCsrf() calls _ensureSession internally).
      const csrf = await this.getCsrf();
      const payload = buildRequestPayload(
        luceneQuery,
        indexes,
        fromTime,
        toTime,
        pageLimit,
        csrf,
        cursor,
      );

      const response = await this._fetchWrapper(apiUrl, {
        method: "POST",
        body: JSON.stringify(payload),
        signal: cancelToken,
      });

      if (!response.ok) {
        throw new Error(
          `Datadog query failed: ${response.status} ${response.statusText}`,
        );
      }

      const data: DatadogLogsResponse = await response.json();
      const logs = processDatadogResponse(data);
      totalProcessed += logs.length;
      onBatchDone(logs);

      const paging = data.result?.paging;
      console.log(
        `[datadog] page ${pageNum}: got ${logs.length} logs, cursor after=${paging?.after?.slice(0, 20)}...`,
      );

      cursor = paging?.after ? paging : undefined;
      if (!cursor || logs.length === 0 || totalProcessed >= limit) break;
    }
  }

  private async getCsrf(): Promise<string> {
    await this._ensureSession();
    return this.session!.csrf;
  }

  private _ensureSession = async (): Promise<void> => {
    await mutex.runExclusive(async () => {
      if (this.session) return;

      const allCookies = await this.ctx.externalAuthProvider.getCookies(
        getAppUrl(this.params.site),
        [SESSION_COOKIE],
        (cookies) => Promise.resolve(!!cookies[SESSION_COOKIE]),
        [
          {
            key: CSRF_KEY,
            js: CSRF_JS,
            waitForResult: true,
            runOnNavigation: true,
          },
        ],
      );

      const csrf = allCookies[CSRF_KEY] ?? "";
      delete allCookies[CSRF_KEY];
      this.session = { all: allCookies, csrf };
    });
  };

  private _fetchWrapper = async (
    url: string,
    options: RequestInitModified = {},
    retryAmount: number = 0,
  ): ReturnType<typeof fetch> => {
    if (retryAmount > 2) {
      throw new Error("Failed to authenticate after multiple attempts");
    }

    await this._ensureSession();

    const appUrl = getAppUrl(this.params.site);
    const headers = options.headers ?? {};

    // Attach session cookies and required headers for Datadog's CSRF protection.
    headers["Cookie"] = Object.entries(this.session!.all)
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
    headers["X-CSRF-Token"] = this.session!.csrf;
    headers["Content-Type"] = "application/json";
    // Rails CSRF validation requires Origin to match the expected app host.
    headers["Origin"] = appUrl;
    headers["Referer"] = `${appUrl}/logs`;
    options.headers = headers;

    // On retry the session CSRF may have changed — keep the request body in sync.
    if (options.body && typeof options.body === "string") {
      try {
        const bodyObj = JSON.parse(options.body) as Record<string, unknown>;
        if ("_authentication_token" in bodyObj) {
          bodyObj._authentication_token = this.session!.csrf;
          options.body = JSON.stringify(bodyObj);
        }
      } catch {
        // body wasn't JSON — leave as-is
      }
    }

    const response = await fetch(url, options);

    if (response.status === 401 || response.status === 403) {
      // Session has expired — clear it so _ensureSession re-authenticates.
      await mutex.runExclusive(async () => {
        this.session = null;
      });
      return this._fetchWrapper(url, options, retryAmount + 1);
    }

    return response;
  };
}
