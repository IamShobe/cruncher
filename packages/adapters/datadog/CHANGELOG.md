# @cruncher/adapter-datadog

## 0.2.0

### Minor Changes

- [#26](https://github.com/IamShobe/cruncher/pull/26) [`52d3af6`](https://github.com/IamShobe/cruncher/commit/52d3af6648fed1e7623a61781e97169856440fd3) Thanks [@IamShobe](https://github.com/IamShobe)! - Add Datadog adapter with browser-session auth, query support, and facet/index autocomplete.
  - Cookie + CSRF-token based authentication via Electron auth window
  - Translates QQL queries to Datadog Lucene syntax
  - Fetches log index names for `index=` autocomplete
  - Fetches facet metadata from `/api/ui/event-platform/logs/facets` for param name suggestions
  - Aggregates top values per dynamic facet for param value suggestions
