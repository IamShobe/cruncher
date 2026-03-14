# @cruncher/adapter-k8s

## 0.2.6

### Patch Changes

- Updated dependencies [[`73a494e`](https://github.com/IamShobe/cruncher/commit/73a494e4f16d067dcc82100ac29fa2dcf2e77a4d)]:
  - @cruncher/qql@0.4.5
  - @cruncher/adapter-utils@0.5.2

## 0.2.5

### Patch Changes

- Updated dependencies [[`069e9dd`](https://github.com/IamShobe/cruncher/commit/069e9ddf615ed4cde05d838108e152dccb5b97b7)]:
  - @cruncher/qql@0.4.4
  - @cruncher/adapter-utils@0.5.1

## 0.2.4

### Patch Changes

- Updated dependencies [[`127cf8d`](https://github.com/IamShobe/cruncher/commit/127cf8d2cc13e77fdde59f7b5b1c027df0a61cea), [`9ca2116`](https://github.com/IamShobe/cruncher/commit/9ca211603b87ca75a6d7b96b51ae321e2dd98f1d)]:
  - @cruncher/qql@0.4.3
  - @cruncher/adapter-utils@0.5.0

## 0.2.3

### Patch Changes

- Updated dependencies [[`5146558`](https://github.com/IamShobe/cruncher/commit/51465584e2584714ae1d8929d96e0ddd2cda4594)]:
  - @cruncher/qql@0.4.2
  - @cruncher/adapter-utils@0.4.1

## 0.2.2

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

- Updated dependencies [[`f8ee20b`](https://github.com/IamShobe/cruncher/commit/f8ee20bc9eb660b73dfca7ad3a3215abee73a122)]:
  - @cruncher/adapter-utils@0.4.0
  - @cruncher/qql@0.4.1

## 0.2.1

### Patch Changes

- Updated dependencies [[`c8060e6`](https://github.com/IamShobe/cruncher/commit/c8060e6eb1e610273bded9d7c43628d843848047)]:
  - @cruncher/qql@0.4.0
  - @cruncher/adapter-utils@0.3.2

## 0.2.0

### Minor Changes

- [`111ec6b`](https://github.com/IamShobe/cruncher/commit/111ec6b488abbec0cf95c3b9df9726155edd5dad) Thanks [@IamShobe](https://github.com/IamShobe)! - Add Kubernetes adapter (`@cruncher/adapter-k8s`) that fetches pod logs via `kubectl`.

  Features:
  - Configurable `kubectl` binary location, context, and namespace
  - Pod filtering via `podFilter` substring match
  - Multi-container support — each container is queried independently and results are merged in timestamp order
  - `toTime` enforced in-process (kubectl has no `--until-time` flag)
  - `logPatterns` for regex-based field extraction (same shape as Docker adapter)
  - `podOverride` to set a custom `messageFieldName` per pod
  - Controller params expose `pod`, `namespace`, `container`, and `phase` dropdowns in the UI
  - Output fields: `_time`, `_sortBy`, `_raw`, `ansi_free_line`, `pod`, `podNamespace`, `container`, `phase`, plus any regex capture groups

### Patch Changes

- Updated dependencies [[`3cd20aa`](https://github.com/IamShobe/cruncher/commit/3cd20aadc4ac3e9a70f15ed542a78e7a36c58059)]:
  - @cruncher/qql@0.3.1
  - @cruncher/adapter-utils@0.3.1
