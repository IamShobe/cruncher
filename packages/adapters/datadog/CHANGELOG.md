# @cruncher/adapter-datadog

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
