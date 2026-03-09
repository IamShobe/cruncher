# @cruncher/adapter-datadog

## 0.2.2

### Patch Changes

- [`127cf8d`](https://github.com/IamShobe/cruncher/commit/127cf8d2cc13e77fdde59f7b5b1c027df0a61cea) Thanks [@IamShobe](https://github.com/IamShobe)! - fix: add `indexing_delay_seconds` parameter (default: 30s) to account for Datadog analytics indexing lag, fixing live mode returning no new logs

- [`9ca2116`](https://github.com/IamShobe/cruncher/commit/9ca211603b87ca75a6d7b96b51ae321e2dd98f1d) Thanks [@IamShobe](https://github.com/IamShobe)! - feat: log row expand/collapse, batched streaming, and connector status UI

  ### adapter-utils
  - Added `isLiveQuery: boolean` to `QueryOptions` to distinguish live polling from initial data loads

  ### adapter-mock
  - Initial queries now stream data in batches of 2000 events (up to 10 k) for a more realistic experience
  - Live polling returns only 1–10 new events per tick (matching real adapter behaviour)
  - Added long-message test entries so the line-clamp / "show more" UI can be tested without a real backend

  ### adapter-datadog
  - Removed incorrect post-processing that dropped empty facets from `getControllerParams` results

- Updated dependencies [[`127cf8d`](https://github.com/IamShobe/cruncher/commit/127cf8d2cc13e77fdde59f7b5b1c027df0a61cea), [`9ca2116`](https://github.com/IamShobe/cruncher/commit/9ca211603b87ca75a6d7b96b51ae321e2dd98f1d)]:
  - @cruncher/qql@0.4.3
  - @cruncher/adapter-utils@0.5.0

## 0.2.1

### Patch Changes

- [`5146558`](https://github.com/IamShobe/cruncher/commit/51465584e2584714ae1d8929d96e0ddd2cda4594) Thanks [@IamShobe](https://github.com/IamShobe)! - Code quality fixes: resolve typecheck errors, lint warnings, and formatting
  - `@cruncher/qql`: Fix `EvalCmd.expression` and `RegexCmd.pattern` types from nullable to required; ASTBuilder now throws on missing contexts instead of silently returning null; remove unused imports and variables
  - `@cruncher/adapter-coralogix`: Fix import extensions to use `.js` suffix for node16 module resolution compatibility
  - `@cruncher/adapter-datadog`: Apply consistent code formatting
  - `@cruncher/adapter-utils`: Apply consistent code formatting

- Updated dependencies [[`5146558`](https://github.com/IamShobe/cruncher/commit/51465584e2584714ae1d8929d96e0ddd2cda4594)]:
  - @cruncher/qql@0.4.2
  - @cruncher/adapter-utils@0.4.1

## 0.2.0

### Minor Changes

- [#26](https://github.com/IamShobe/cruncher/pull/26) [`52d3af6`](https://github.com/IamShobe/cruncher/commit/52d3af6648fed1e7623a61781e97169856440fd3) Thanks [@IamShobe](https://github.com/IamShobe)! - Add Datadog adapter with browser-session auth, query support, and facet/index autocomplete.
  - Cookie + CSRF-token based authentication via Electron auth window
  - Translates QQL queries to Datadog Lucene syntax
  - Fetches log index names for `index=` autocomplete
  - Fetches facet metadata from `/api/ui/event-platform/logs/facets` for param name suggestions
  - Aggregates top values per dynamic facet for param value suggestions
