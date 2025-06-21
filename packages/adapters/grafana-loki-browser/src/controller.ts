import { Mutex } from "async-mutex";
import {
  AdapterContext,
  QueryOptions,
  QueryProvider,
} from "@cruncher/adapter-utils";
import {
  asNumberField,
  ObjectFields,
  ProcessedData,
  processField,
} from "@cruncher/adapter-utils/logTypes";
import { ControllerIndexParam, Search } from "@cruncher/qql/grammar";
import { buildQuery, LIMIT } from "./query";
import { Frame, GrafanaLabelFilter } from "./types";

// request mutex to prevent multiple requests at the same time
const mutex = new Mutex();

const getAllObjects = (frames: Frame[]): ProcessedData[] => {
  const objects = frames.map((frame) => frame.data.values[0]).flat();
  const timestamps = frames.map((frame) => frame.data.values[1]).flat();
  const messages = frames.map((frame) => frame.data.values[2]).flat();
  const nanoSeconds = frames.map((frame) => frame.data.values[3]).flat();
  const indexInfo = frames.map((frame) => frame.data.values[4]).flat();
  const uniqueIds = frames.map((frame) => frame.data.values[5]).flat();

  const processedData = {
    objects,
    timestamps,
    messages,
    nanoSeconds,
    indexInfo,
    uniqueIds,
  };

  const getRow = (index: number) => {
    const object = processedData.objects[index];
    const timestamp = processedData.timestamps[index];
    const message = processedData.messages[index];
    const nanoSeconds = parseInt(processedData.nanoSeconds[index]);
    const uniqueId = processedData.uniqueIds[index];

    const objectFields: ObjectFields = {
      _time: {
        type: "date",
        value: timestamp,
      },
      _sortBy: {
        type: "number",
        value: nanoSeconds,
      },
      _uniqueId: {
        type: "string",
        value: uniqueId,
      },
      _raw: {
        type: "string",
        value: JSON.stringify(object),
      },
    };

    Object.entries(object).forEach(([key, value]) => {
      objectFields[key] = processField(value);
    });

    return {
      object: objectFields,
      message,
    };
  };

  return processedData.objects
    .map((_, index) => getRow(index))
    .sort(
      (a, b) =>
        asNumberField(b.object._sortBy).value -
        asNumberField(a.object._sortBy).value,
    ); // TODO: optimize and map sorting
};

type RequestInitModified = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

export class GrafanaController implements QueryProvider {
  private cookies: {
    sessionCookie: string;
    expiryTime: Date;
  } | null = null;

  constructor(
    private context: AdapterContext,
    private url: string,
    private uid: string,
    private filter: GrafanaLabelFilter[],
    private filterExtensions?: string[],
  ) {}

  private _fetchWrapper = async (
    url: string,
    options: RequestInitModified = {},
    retryAmount: number = 0,
  ): Promise<ReturnType<typeof fetch>> => {
    if (retryAmount > 2) {
      throw new Error("Failed to authenticate after multiple attempts");
    }

    await mutex.runExclusive(async () => {
      // check if we dont have cookies or they are expired
      if (!this.cookies || this.cookies.expiryTime < new Date()) {
        console.warn("Session expired, re-authenticating...");

        // re-authenticate
        const response = await this.context.externalAuthProvider.getCookies(
          this.url,
          ["grafana_session", "grafana_session_expiry"],
          checkValidCookies,
        );

        this.cookies = {
          sessionCookie: response["grafana_session"],
          expiryTime: new Date(
            parseInt(response["grafana_session_expiry"]) * 1000,
          ), // Convert seconds to milliseconds
        };
      }

      const headers = options.headers || {};
      const existingCookie = headers["Cookie"] || "";
      if (this.cookies) {
        let cookieString = existingCookie;
        if (this.cookies.sessionCookie) {
          // get epoch time from expires date
          const expiresEpoch = Math.floor(
            this.cookies.expiryTime.getTime() / 1000,
          );
          cookieString += `;grafana_session=${this.cookies.sessionCookie};grafana_session_expiry=${expiresEpoch}`;
        }
        headers["Cookie"] = cookieString;
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

  private _doQuery = async (
    controllerParams: ControllerIndexParam[],
    searchTerm: Search,
    options: QueryOptions,
  ) => {
    const query = buildQuery(
      this.uid,
      this.filter,
      controllerParams,
      searchTerm,
      options.fromTime,
      options.toTime,
      this.filterExtensions,
    );
    console.log(query);

    const url = `${this.url}/api/ds/query?ds_type=loki&requestId=explore_gsx_1`;
    const response = await this._fetchWrapper(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(query),
      signal: options.cancelToken,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to execute query: ${response.status} ${response.statusText}`,
      );
    }

    const data: any = await response.json();

    if (data.results.A.status != 200) {
      throw new Error("Failed to execute query");
    }

    return getAllObjects(data.results.A.frames);
  };

  private _getLabels = async () => {
    const url = `${this.url}/api/datasources/uid/${this.uid}/resources/labels`;
    const response = await this._fetchWrapper(url);
    const resp: any = await response.json();
    return resp.data as string[];
  };

  private _getLabelValues = async (label: string) => {
    const url = `${this.url}/api/datasources/uid/${this.uid}/resources/label/${label}/values`;
    const response = await this._fetchWrapper(url);
    const resp: any = await response.json();
    return resp.data as string[];
  };

  private _getControllerParams = async () => {
    const labels = await this._getLabels();
    const resp: Record<string, string[]> = {};
    const promises = labels.map((label) => {
      return this._getLabelValues(label).then((values) => {
        resp[label] = values;
      });
    });

    await Promise.all(promises);

    return resp;
  };

  private _runAllBatches = async (
    controllerParams: ControllerIndexParam[],
    searchTerm: Search,
    options: QueryOptions,
  ) => {
    let currentLimit = options.limit;
    while (true) {
      const objects = await this._doQuery(
        controllerParams,
        searchTerm,
        options,
      );
      console.log("batch retrieved", objects.length);
      options.onBatchDone(objects);
      currentLimit -= objects.length;
      if (currentLimit <= 0) {
        break; // limit reached!
      }

      // get last timestamp
      const fromTime = options.fromTime.getTime();
      const earliestTimestamp =
        objects.length > 0
          ? asNumberField(objects[objects.length - 1].object._time).value
          : 0;
      if (
        earliestTimestamp === 0 ||
        !(earliestTimestamp > fromTime && objects.length === LIMIT)
      ) {
        break;
      }

      // assume we reached the limit - try to get the next batch
      options.toTime = new Date(earliestTimestamp - 1);
    }
  };

  query(
    contollerParams: ControllerIndexParam[],
    searchTerm: Search,
    options: QueryOptions,
  ): Promise<void> {
    return this._runAllBatches(contollerParams, searchTerm, options);
  }

  getControllerParams(): Promise<Record<string, string[]>> {
    return this._getControllerParams();
  }
}

const checkValidCookies = (
  cookies: Record<string, string>,
): Promise<boolean> => {
  const grafanaExpiryCookie = cookies["grafana_session_expiry"];
  const grafanaSessionCookie = cookies["grafana_session"];
  try {
    if (grafanaExpiryCookie) {
      const expiryTime = new Date(parseInt(grafanaExpiryCookie) * 1000); // Convert seconds to milliseconds
      console.log("Grafana Expiry Time:", expiryTime);
      if (expiryTime > new Date() && grafanaSessionCookie) {
        console.log("Grafana session is valid, expiry time is in the future.");
        return Promise.resolve(true);
      }
    }
  } catch (error) {
    console.error("Error parsing Grafana cookies:", error);
  }

  console.info(
    "Grafana expiry cookie not found or expired - prompting user to login again.",
  );
  return Promise.resolve(false);
};
