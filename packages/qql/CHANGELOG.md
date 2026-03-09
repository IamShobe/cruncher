## 0.4.3

### Patch Changes

- [`127cf8d`](https://github.com/IamShobe/cruncher/commit/127cf8d2cc13e77fdde59f7b5b1c027df0a61cea) Thanks [@IamShobe](https://github.com/IamShobe)! - fix: ASTBuilder no longer throws on incomplete `eval`/`regex` pipeline commands — uses `addError()` + dummy return instead, allowing suggestion collection to proceed and autocomplete to work after typing `| eval` or `| regex` with no expression yet

## 0.4.2

### Patch Changes

- [`5146558`](https://github.com/IamShobe/cruncher/commit/51465584e2584714ae1d8929d96e0ddd2cda4594) Thanks [@IamShobe](https://github.com/IamShobe)! - Code quality fixes: resolve typecheck errors, lint warnings, and formatting
  - `@cruncher/qql`: Fix `EvalCmd.expression` and `RegexCmd.pattern` types from nullable to required; ASTBuilder now throws on missing contexts instead of silently returning null; remove unused imports and variables
  - `@cruncher/adapter-coralogix`: Fix import extensions to use `.js` suffix for node16 module resolution compatibility
  - `@cruncher/adapter-datadog`: Apply consistent code formatting
  - `@cruncher/adapter-utils`: Apply consistent code formatting

## 0.4.1

### Patch Changes

- [`f8ee20b`](https://github.com/IamShobe/cruncher/commit/f8ee20bc9eb660b73dfca7ad3a3215abee73a122) Thanks [@IamShobe](https://github.com/IamShobe)! - Add timezone-aware formatting, live mode support, and row identity

  **cruncher**
  - Add LIVE button in header with animated pulse indicator and keyboard shortcut to toggle live mode
  - Add `useLiveMode` hook that polls for new data at configurable intervals with jitter
  - Add `appendQuery` engine method: fetches new data for a time window, merges with existing raw data, re-runs pipeline, trims to `maxLogs`
  - Auto-stop live mode after configurable minutes (default 30)
  - New log highlight animation (teal flash) for rows arriving during live mode
  - Disable live mode automatically when user triggers a new manual query
  - Assign stable UUIDs to log rows for reliable expand/collapse across live updates
  - Add local/UTC timezone setting applied to all timestamp rendering
  - Add `liveInterval`, `maxLogs`, `liveAutoStopMinutes`, and `timezone` settings persisted to config file
  - Config loading now returns an `ok/error` result instead of throwing on invalid config
  - Add toggleable idle hints in the query editor
  - Add live mode guide to documentation

  **@cruncher/adapter-utils**
  - `formatDataTime` and `formatDataTimeShort` now accept an optional `timezone` parameter (`"local"` | `"utc"`), defaulting to `"local"`
  - Export new `Timezone` type
  - Add optional `id` field to `ProcessedData` type for stable row identity across live updates

  **@cruncher/adapter-mock**
  - Return a randomized sample of results per query to better simulate live data streams

  **@cruncher/adapter-k8s**
  - Code formatting only (no logic changes)

  **@cruncher/qql**
  - Code formatting only across parser, ASTBuilder, and SuggestionCollector (no logic changes)

## 0.4.0

### Minor Changes

- [`c8060e6`](https://github.com/IamShobe/cruncher/commit/c8060e6eb1e610273bded9d7c43628d843848047) Thanks [@IamShobe](https://github.com/IamShobe)! - Complete refactor for QQL engine + much better highlight and autocomplete engines

## 0.3.1

### Patch Changes

- [`3cd20aa`](https://github.com/IamShobe/cruncher/commit/3cd20aadc4ac3e9a70f15ed542a78e7a36c58059) Thanks [@IamShobe](https://github.com/IamShobe)! - Fix three bugs in QQL parser:
  - `isNumeric`: unescaped dot in regex caused strings like `123a456` to be misclassified as numeric
  - `getNextPos`: could return `undefined` at EOF, corrupting autocomplete suggestion ranges with `NaN`
  - `remove()`: `splice(indexOf(...), 1)` with a -1 result silently removed an unrelated suggestion from the list

## 0.3.0

### Minor Changes

- [#17](https://github.com/IamShobe/cruncher/pull/17) [`c2b248c`](https://github.com/IamShobe/cruncher/commit/c2b248c10816d9f184654d78db9087771521789f) Thanks [@IamShobe](https://github.com/IamShobe)! - Migrate to Turborepo, new CI pipeline, new linter, and various enhancements

## 0.2.4 (2025-06-21)

### 🩹 Fixes

- created new standard for adapters - and new codegen for it ([#15](https://github.com/IamShobe/cruncher/pull/15))

## 0.2.3 (2025-06-21)

### 🩹 Fixes

- Update ci stuff ([#13](https://github.com/IamShobe/cruncher/pull/13))

## 0.2.2 (2025-06-21)

### 🩹 Fixes

- test bump ([5d62e3c](https://github.com/IamShobe/cruncher/commit/5d62e3c))

## 0.2.1 (2025-06-21)

### 🩹 Fixes

- new release flow ([e9ace0d](https://github.com/IamShobe/cruncher/commit/e9ace0d))

## 0.2.0 (2025-06-21)

### 🚀 Features

- nx initial commit ([883376b](https://github.com/IamShobe/cruncher/commit/883376b))
