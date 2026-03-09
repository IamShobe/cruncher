import { QueryOptions, QueryProvider } from "@cruncher/adapter-utils";
import {
  asNumberField,
  ObjectFields,
  ProcessedData,
  processField,
} from "@cruncher/adapter-utils/logTypes";
import { ControllerIndexParam, Search } from "@cruncher/qql/grammar";
import { buildDoesLogMatchCallback } from "@cruncher/qql/searchTree";

const tagsOptions = ["nice", "developer", "collector"];
const data: Record<string, unknown>[] = [
  {
    key: "1",
    name: "John Brown",
    age: 32,
    address: "New York No. 1 Lake Park",
    tags: ["nice", "developer"],
  },
  // Long message entries for testing line-clamp + "show more"
  {
    key: "long-1",
    name: "Alice Longmessage",
    age: 28,
    level: "error",
    address: "500 Stack Trace Lane",
    tags: ["developer"],
    message:
      "Error: Something went terribly wrong during the processing of the request. The upstream service returned a 503 status code after 30 seconds. This caused a cascading failure across multiple downstream services. The retry logic attempted 5 retries with exponential backoff but all failed. Please investigate the upstream service health and check the load balancer configuration.",
    stacktrace:
      "Error: Upstream timeout\n  at fetchUpstream (services/upstream.ts:42:11)\n  at processRequest (handlers/request.ts:87:5)\n  at async Router.handle (router.ts:123:3)",
  },
  {
    key: "long-2",
    name: "Bob Multiline",
    age: 35,
    level: "warn",
    address: "99 Newline Boulevard",
    tags: ["collector"],
    message:
      "Warning: Configuration drift detected.\nExpected: { replicas: 3, memory: '512Mi' }\nActual:   { replicas: 1, memory: '256Mi' }\nThis may cause degraded performance under load.\nRecommended action: run `kubectl apply -f deployment.yaml` to reconcile.",
  },
  {
    key: "long-3",
    name: "Carol Deepobject",
    age: 31,
    level: "error",
    address: "7 Nested Object Road",
    tags: ["developer"],
    metadata: {
      request: {
        method: "POST",
        path: "/api/v2/process",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer <redacted>",
          "x-request-id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        },
        body: { userId: 42, payload: { action: "submit", items: [1, 2, 3] } },
      },
      response: {
        status: 500,
        latencyMs: 3421,
        body: { error: "Internal Server Error", code: "UPSTREAM_TIMEOUT" },
      },
      retries: [
        { attempt: 1, delayMs: 100, status: 503 },
        { attempt: 2, delayMs: 200, status: 503 },
        { attempt: 3, delayMs: 400, status: 503 },
      ],
    },
  },
  {
    key: "long-4",
    name: "Dave Longarray",
    age: 44,
    level: "error",
    address: "1024 Array Street",
    tags: ["developer", "collector"],
    events: [
      "pod/worker-1 OOMKilled",
      "pod/worker-2 OOMKilled",
      "pod/worker-3 Evicted",
      "node/node-4 NotReady",
      "deployment/backend ScaledDown",
      "hpa/backend MinReplicasReached",
      "service/backend Degraded",
      "alertmanager: PagerDuty fired P1",
    ],
    longStringField:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
];

const longMessages = [
  "Error: Connection pool exhausted after 30s. All 50 connections are in use. Waiting threads: 23. Last successful acquire: 47ms ago. Last query: SELECT u.id, u.name, u.email, r.role_name, p.permission_key FROM users u JOIN user_roles ur ON u.id = ur.user_id JOIN roles r ON ur.role_id = r.id JOIN role_permissions rp ON r.id = rp.role_id JOIN permissions p ON rp.permission_id = p.id WHERE u.created_at > NOW() - INTERVAL 1 HOUR ORDER BY u.created_at DESC LIMIT 10000. Stacktrace: at ConnectionPool.acquire (db/pool.ts:87) at QueryRunner.run (db/runner.ts:42) at async RequestHandler.handle (server/handler.ts:113) at async Middleware.process (middleware/auth.ts:56)",
  "Warning: Slow query detected (4823ms) on replica db-replica-2. Query: SELECT u.id, u.name, u.email, o.total, o.status, o.created_at, p.name AS product_name, p.sku, i.quantity FROM users u LEFT JOIN orders o ON u.id = o.user_id LEFT JOIN order_items oi ON o.id = oi.order_id LEFT JOIN products p ON oi.product_id = p.id LEFT JOIN inventory i ON p.id = i.product_id WHERE u.created_at > '2024-01-01' AND o.status IN ('pending', 'processing', 'shipped') AND i.quantity < 10 ORDER BY o.created_at DESC. Execution plan shows full table scan on orders (42M rows). Consider adding composite index on (user_id, status, created_at) and partitioning inventory by warehouse_id.",
  "FATAL: Out of memory exception in worker thread #7. The process has exceeded the configured heap limit.\nHeap used: 2.1 GB / 2.1 GB\nExternal memory: 312 MB\nArray buffers: 89 MB\nRSS total: 2.6 GB\nGarbage collector ran 847 times in the last 60s with 0 bytes reclaimed.\nLast 5 allocations: ImageProcessor.resize (512MB), CacheManager.hydrate (384MB), ReportGenerator.build (256MB), SessionStore.flush (128MB), MetricsAggregator.snapshot (64MB).\nNode.js v20.11.0 — process will restart in 5s.",
  "Exception in thread 'main' java.lang.NullPointerException: Cannot invoke method getId() on null object reference\n\tat com.example.service.UserService.processRequest(UserService.java:142)\n\tat com.example.service.UserService.validateAndEnrich(UserService.java:98)\n\tat com.example.controller.ApiController.handlePost(ApiController.java:87)\n\tat com.example.middleware.AuthMiddleware.doFilter(AuthMiddleware.java:54)\n\tat org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:117)\n\tat sun.reflect.NativeMethodAccessorImpl.invoke0(NativeMethodAccessorImpl.java)\n\tat sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)\nCaused by: com.example.exception.EntityNotFoundException: User with id=99471 not found in primary or replica datasource",
  "Kubernetes pod eviction triggered on node/worker-node-3 (region: eu-west-1, zone: eu-west-1b). Evicted pods: pod/api-server-7d9f8b-xkp2q, pod/api-server-7d9f8b-mn3rt, pod/worker-7f6c9d-pp1qz. Reason: The node was low on resource: memory. Threshold quantity: 100Mi, available: 43Mi. Node capacity: cpu=8, memory=16Gi. Pending daemonsets: fluentd, prometheus-node-exporter. Recommended actions: (1) increase node memory to 32Gi, (2) set pod memory requests to 256Mi and limits to 512Mi, (3) enable cluster autoscaler with min=3 max=10 nodes, (4) add PodDisruptionBudget to prevent simultaneous evictions.",
];

for (let i = 2; i <= 100000; i++) {
  const randomTags = [
    tagsOptions[Math.floor(Math.random() * tagsOptions.length)],
    tagsOptions[Math.floor(Math.random() * tagsOptions.length)],
  ];

  // generate random field keys
  const fields: Record<string, string> = {};

  const randomFieldsCount = Math.floor(Math.random() * 10) + 1;
  for (let j = 0; j < randomFieldsCount; j++) {
    fields[`field${j}`] = `value${j}`;
  }

  // ~1 in 20 entries gets a long message and error level
  const isLargeLog = i % 20 === 0;

  data.push({
    key: i.toString(),
    name: `Name ${i}`,
    age: 20 + (i % 50),
    address: `Address ${i}`,
    tags: randomTags,
    ...(isLargeLog && {
      level: "error",
      message: longMessages[Math.floor(Math.random() * longMessages.length)],
    }),
    ...fields,
  });
}

// Ensure the long test entries always appear in results regardless of search
const longTestKeys = new Set(["long-1", "long-2", "long-3", "long-4"]);

// Used for testing purposes
export const MockController = {
  query: async (
    contollerParams: ControllerIndexParam[],
    searchTerm: Search,
    options: QueryOptions,
  ): Promise<void> => {
    if (contollerParams.length > 0) {
      throw new Error("Controller params not supported");
    }

    const doesLogMatch = buildDoesLogMatchCallback(searchTerm);
    return new Promise((resolve, reject) => {
      // filter using the search term
      const itemToMessage = (item: (typeof data)[number]) => {
        if (typeof item.message === "string") return item.message;
        const tags = Array.isArray(item.tags)
          ? (item.tags as string[]).join(", ")
          : "";
        return `Name: ${item.name}, Age: ${item.age}, Address: ${item.address}, Tags: ${tags}`;
      };
      const filteredData = data.filter((item) => {
        // always include the long test entries so they show up for manual testing
        if (longTestKeys.has(item.key as string)) return true;
        const message = itemToMessage(item);
        const tags = Array.isArray(item.tags) ? (item.tags as string[]) : [];
        return [
          item.name as string,
          item.address as string,
          message,
          ...tags,
        ].some((field) => doesLogMatch(field));
      });

      const fromTime = options.fromTime;
      const toTime = options.toTime;

      const toProcessedData = (item: (typeof data)[number]): ProcessedData => {
        const randomTime =
          Math.floor(Math.random() * (toTime.getTime() - fromTime.getTime())) +
          fromTime.getTime();
        const fields: ObjectFields = {
          _time: { type: "date", value: randomTime },
          _raw: { type: "string", value: JSON.stringify(item) },
        };
        Object.entries(item).forEach(([key, value]) => {
          fields[key] = processField(value);
        });
        return { object: fields, message: itemToMessage(item) };
      };

      const shuffled = [...filteredData].sort(() => Math.random() - 0.5);

      if (options.isLiveQuery) {
        // Live: simulate 1–10 new events arriving
        const count = Math.floor(Math.random() * 10) + 1;
        const result = shuffled.slice(0, count).map(toProcessedData);
        result.sort(
          (a, b) =>
            asNumberField(b.object._time).value -
            asNumberField(a.object._time).value,
        );
        const delay = Math.floor(Math.random() * 1000) + 500;
        const timeout = setTimeout(() => {
          options.onBatchDone(result);
          resolve();
        }, delay);
        options.cancelToken.addEventListener("abort", () => {
          clearTimeout(timeout);
          reject("Query cancelled");
        });
      } else {
        // Initial load: stream up to 10k items in batches of 2000
        const BATCH_SIZE = 2000;
        const capped = shuffled.slice(0, 10000);
        let batchIndex = 0;
        let cancelled = false;

        options.cancelToken.addEventListener("abort", () => {
          cancelled = true;
          reject("Query cancelled");
        });

        const sendNextBatch = () => {
          if (cancelled) return;
          const batch = capped
            .slice(batchIndex, batchIndex + BATCH_SIZE)
            .map(toProcessedData);
          batch.sort(
            (a, b) =>
              asNumberField(b.object._time).value -
              asNumberField(a.object._time).value,
          );
          options.onBatchDone(batch);
          batchIndex += BATCH_SIZE;

          if (batchIndex < capped.length) {
            const delay = Math.floor(Math.random() * 400) + 100;
            setTimeout(sendNextBatch, delay);
          } else {
            resolve();
          }
        };

        const initialDelay = Math.floor(Math.random() * 500) + 200;
        setTimeout(sendNextBatch, initialDelay);
      }
    });
  },
  getControllerParams(): Promise<Record<string, string[]>> {
    return Promise.resolve({
      label1: ["value1", "value2", "value3"],
    });
  },
} satisfies QueryProvider;
