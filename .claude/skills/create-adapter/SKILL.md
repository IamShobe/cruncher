---
name: create-adapter
description: >
  Guides end-to-end creation of a new Cruncher data-source adapter (plugin).
  Use this skill whenever the user asks to "add an adapter", "create a new connector",
  "add support for <service> logs", "build a plugin for <tool>", or similar requests
  involving bringing a new log/data source into Cruncher. Covers the full workflow:
  package scaffolding, TypeScript implementation, app registration, documentation,
  and changeset. Even if the user only mentions one part (e.g. "add docs for the X adapter"),
  consult this skill to follow the right conventions for the whole repo.
---

# Creating a Cruncher Adapter

A Cruncher adapter is a TypeScript package in `packages/adapters/<name>/` that implements
`QueryProvider` from `@cruncher/adapter-utils`. It fetches logs/data from a source,
transforms them into `ProcessedData`, and exposes filter dropdowns ("controller params")
to the UI.

The Docker and Kubernetes adapters are the canonical references — read them before
implementing a new one:
- `packages/adapters/docker/src/index.ts` + `controller.ts`
- `packages/adapters/k8s/src/index.ts` + `controller.ts`

---

## Step 1 — Understand the new source

Before writing any code, clarify:
- How does the source expose data? (CLI binary, HTTP API, SDK, file, …)
- What's the natural "unit" of grouping? (container, pod, service, host, …)
- What fields does each log entry carry? (timestamp format, message field, metadata, …)
- What filter dimensions make sense as UI dropdowns?

If it's a CLI binary (like docker/kubectl), model it after the Docker adapter.
If it's an HTTP API, look at the Loki or Coralogix adapter for patterns.

---

## Step 2 — Scaffold the package

Create `packages/adapters/<name>/` with this layout:

```
packages/adapters/<name>/
├── .gitignore          # copy from docker adapter
├── package.json
├── tsconfig.json       # copy from docker adapter, no changes needed
└── src/
    ├── index.ts        # params schema + Adapter object
    └── controller.ts   # QueryProvider implementation
```

### `package.json`

```json
{
  "name": "@cruncher/adapter-<name>",
  "version": "0.1.0",
  "repository": { "type": "git", "url": "https://github.com/IamShobe/cruncher" },
  "description": "<Source> adapter for Cruncher.",
  "type": "module",
  "publishConfig": { "access": "public" },
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": { "default": "./dist/index.js", "types": "./dist/index.d.ts" }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsc --project tsconfig.json",
    "format": "oxfmt src/",
    "format:check": "oxfmt --check src/",
    "prepublishOnly": "npm run build"
  },
  "keywords": ["cruncher", "qql", "query-language", "<name>", "adapter"],
  "author": { "name": "Elran Shefer" },
  "license": "GPL-3.0-only",
  "dependencies": {
    "@cruncher/adapter-utils": "workspace:*",
    "@cruncher/qql": "workspace:*",
    "ansicolor": "^2.0.3",
    "merge-k-sorted-arrays": "^2.1.0",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@types/node": "^25.3.5",
    "typescript": "^5.9.3"
  }
}
```

Add or remove dependencies as needed (e.g. an HTTP adapter might add `axios`).

---

## Step 3 — Implement `src/index.ts`

This file defines the params schema (Zod) and the `Adapter` export.

```ts
import { z } from "zod/v4";
import { Adapter, newPluginRef, QueryProvider } from "@cruncher/adapter-utils";
import { MyController } from "./controller";

const paramsSchema = z.object({
  // binaryLocation / url / apiKey — whatever the source needs
  binaryLocation: z.string().default("mytool"),
  // logPatterns is a standard optional field on CLI-based adapters:
  logPatterns: z.array(z.object({
    name: z.string(),
    pattern: z.string(),
    applyTo: z.array(z.string()).default([]),
    exclude: z.array(z.string()).default([]),
    applyToAll: z.boolean().default(false),
    messageFieldName: z.string().optional(),
  })).default([]),
});

export type MyParams = z.infer<typeof paramsSchema>;
export type MyLogPatterns = z.infer<typeof paramsSchema.shape.logPatterns>;

const adapter: Adapter = {
  ref: newPluginRef("<name>"),       // short lowercase identifier, e.g. "k8s", "docker"
  name: "<Source> Logs",
  description: "Adapter for <Source> logs",
  version: "0.1.0",
  params: paramsSchema,
  factory: (_context, { params }): QueryProvider => {
    return new MyController(paramsSchema.parse(params));
  },
};

export default adapter;
```

The `ref` string (e.g. `"k8s"`) is what users write in `cruncher.config.yaml` as `type:`.

---

## Step 4 — Implement `src/controller.ts`

The controller implements `QueryProvider`:

```ts
interface QueryProvider {
  getControllerParams(): Promise<Record<string, string[]>>;
  query(params: ControllerIndexParam[], searchTerm: Search, options: QueryOptions): Promise<void>;
}
```

### `getControllerParams()`

Returns the filter options shown as dropdowns in the UI. Fetch live data from the source and return a map of `{ dimensionName: string[] }`. Example for k8s:
```ts
return { pod: [...], namespace: [...], container: [...], phase: [...] };
```

### `query()`

Standard pattern:
1. `const doesLogMatch = buildDoesLogMatchCallback(searchTerm);`
2. Fetch available "units" (containers, pods, services, …)
3. Filter by `controllerParams` — what the user selected in the UI
4. `await Promise.all(units.map(u => this.fetchLogs(u, fromTime, toTime, doesLogMatch, cancelToken)))`
5. `merge<ProcessedData>(allLogs, compareProcessedData)` to sort by time across units
6. `options.onBatchDone(results.slice(0, options.limit))`

### Parsing log lines into `ProcessedData`

Each log entry becomes:

```ts
const object: ObjectFields = {
  _time:   { type: "date",   value: timestamp.getTime() },
  _sortBy: { type: "number", value: timestamp.getTime() },
  _raw:    { type: "string", value: originalLine },
  ansi_free_line: processField(strippedLine),
  // source-specific identity fields:
  myUnit: processField(unitName),
  // ...plus any parsed fields from logPatterns:
  ...fields,
};

return {
  object,
  message: asStringField(object[selectedMessageFieldName]).value,
} satisfies ProcessedData;
```

Sort within each unit **descending** by `_sortBy` before returning (merge expects sorted arrays).

### Key imports

```ts
import { QueryOptions, QueryProvider } from "@cruncher/adapter-utils";
import { asStringField, compareProcessedData, ObjectFields, ProcessedData, processField } from "@cruncher/adapter-utils/logTypes";
import { ControllerIndexParam, Search } from "@cruncher/qql/grammar";
import { BooleanSearchCallback, buildDoesLogMatchCallback } from "@cruncher/qql/searchTree";
import merge from "merge-k-sorted-arrays";
import { strip } from "ansicolor";
import { spawn } from "child_process";   // for CLI-based adapters
```

### logPatterns helper

For CLI adapters that support `logPatterns`, use the same `intelligentParse` pattern as the Docker/k8s adapters — try JSON.parse first, then apply each matching pattern's regex, collecting named capture groups into `parsed`.

### PATH for CLI adapters

Spawn subprocesses with an explicit PATH so the binary is findable:
```ts
const env = Object.assign({}, process.env, {
  PATH: "/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin",
});
```

### Cancellation

Always wire up the `cancelToken`:
```ts
const abortHandler = () => { process.kill("SIGTERM"); reject(new Error("Query cancelled")); };
cancelToken.addEventListener("abort", abortHandler);
childProcess.on("close", () => cancelToken.removeEventListener("abort", abortHandler));
```

---

## Step 5 — Build and verify

```bash
pnpm install                              # link new workspace package
pnpm --filter @cruncher/adapter-<name> build
```

Fix any TypeScript errors before moving on.

---

## Step 6 — Register in the app

**`apps/cruncher/package.json`** — add to `dependencies`:
```json
"@cruncher/adapter-<name>": "workspace:*"
```

**`apps/cruncher/src/processes/server/main.ts`** — add import and registration:
```ts
import myAdapter from "@cruncher/adapter-<name>";
// ...inside initializeServer():
engineV2.registerPlugin(myAdapter);
```

---

## Step 7 — Write documentation

Create `docs/src/content/docs/adapters/<name>.mdx` following the Docker or Kubernetes doc as a template. The sidebar is auto-generated from the `adapters/` directory.

Also create two example config files in `docs/src/content/docs/adapters/examples/`:
- `<name>.cruncher.config.yaml` — minimal working config
- `<name>-patterns.cruncher.config.yaml` — config with logPatterns and overrides

The `.mdx` file should include:
- `<Badge text="<ref>" />` matching the adapter's `ref` string
- All params as `<ParamItem>` components
- Output fields table
- Controller params table (the UI dropdowns)
- Any important limitations or notes
- Both example configs via `<Code>` imports

---

## Step 8 — Create a changeset

```bash
# from repo root:
pnpm changeset
# select @cruncher/adapter-<name>, choose "minor" (new package), write a description
```

Or create `.changeset/<descriptive-name>.md` manually:

```md
---
"@cruncher/adapter-<name>": minor
---

Add <Source> adapter that fetches logs via <mechanism>.
```

---

## Step 9 — Commit

Stage only the adapter-related files:
```bash
git add packages/adapters/<name>/ \
        apps/cruncher/package.json \
        apps/cruncher/src/processes/server/main.ts \
        docs/src/content/docs/adapters/<name>.mdx \
        docs/src/content/docs/adapters/examples/<name>*.yaml \
        .changeset/<changeset-file>.md \
        pnpm-lock.yaml
git commit -m "feat: add @cruncher/adapter-<name> <Source> adapter"
```

---

## Config file format (for testing)

Add an entry to `~/.config/cruncher/cruncher.config.yaml`:

```yaml
connectors:
  - name: my-source
    type: <ref>      # matches adapter's ref string
    params:
      # adapter-specific params here
```

---

## Quick sanity checklist

- [ ] `pnpm --filter @cruncher/adapter-<name> build` passes with no errors
- [ ] `getControllerParams()` returns at least one non-empty dimension
- [ ] `query()` calls `options.onBatchDone` exactly once
- [ ] Each `ProcessedData` entry has `_time`, `_sortBy`, `_raw`, `message`
- [ ] `cancelToken` is wired up to kill the subprocess / abort the request
- [ ] Adapter is registered in `main.ts`
- [ ] Docs page created and example configs added
- [ ] Changeset created with `minor` bump
