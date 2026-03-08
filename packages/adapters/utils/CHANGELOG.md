## 0.4.0

### Minor Changes

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

### Patch Changes

- Updated dependencies [[`f8ee20b`](https://github.com/IamShobe/cruncher/commit/f8ee20bc9eb660b73dfca7ad3a3215abee73a122)]:
  - @cruncher/qql@0.4.1

## 0.3.2

### Patch Changes

- Updated dependencies [[`c8060e6`](https://github.com/IamShobe/cruncher/commit/c8060e6eb1e610273bded9d7c43628d843848047)]:
  - @cruncher/qql@0.4.0

## 0.3.1

### Patch Changes

- Updated dependencies [[`3cd20aa`](https://github.com/IamShobe/cruncher/commit/3cd20aadc4ac3e9a70f15ed542a78e7a36c58059)]:
  - @cruncher/qql@0.3.1

## 0.3.0

### Minor Changes

- [#17](https://github.com/IamShobe/cruncher/pull/17) [`c2b248c`](https://github.com/IamShobe/cruncher/commit/c2b248c10816d9f184654d78db9087771521789f) Thanks [@IamShobe](https://github.com/IamShobe)! - Migrate to Turborepo, new CI pipeline, new linter, and various enhancements

### Patch Changes

- Updated dependencies [[`c2b248c`](https://github.com/IamShobe/cruncher/commit/c2b248c10816d9f184654d78db9087771521789f)]:
  - @cruncher/qql@0.3.0
  - @cruncher/utils@0.3.0

## 0.2.4 (2025-06-21)

### 🩹 Fixes

- created new standard for adapters - and new codegen for it ([#15](https://github.com/IamShobe/cruncher/pull/15))

### 🧱 Updated Dependencies

- Updated @cruncher/utils to 0.2.4
- Updated @cruncher/qql to 0.2.4

## 0.2.3 (2025-06-21)

### 🩹 Fixes

- fix typing ([9374f27](https://github.com/IamShobe/cruncher/commit/9374f27))

## 0.2.2 (2025-06-21)

### 🩹 Fixes

- Update ci stuff ([#13](https://github.com/IamShobe/cruncher/pull/13))

### 🧱 Updated Dependencies

- Updated @cruncher/utils to 0.2.3
- Updated @cruncher/qql to 0.2.3

## 0.2.1 (2025-06-21)

### 🧱 Updated Dependencies

- Updated @cruncher/utils to 0.2.2
- Updated @cruncher/qql to 0.2.2

## 0.2.0 (2025-06-21)

### 🚀 Features

- nx initial commit ([883376b](https://github.com/IamShobe/cruncher/commit/883376b))

### 🧱 Updated Dependencies

- Updated @cruncher/utils to 0.2.0
- Updated @cruncher/qql to 0.2.0
