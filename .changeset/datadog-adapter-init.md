---
"@cruncher/adapter-datadog": minor
---

Add Datadog adapter with browser-session auth, query support, and facet/index autocomplete.

- Cookie + CSRF-token based authentication via Electron auth window
- Translates QQL queries to Datadog Lucene syntax
- Fetches log index names for `index=` autocomplete
- Fetches facet metadata from `/api/ui/event-platform/logs/facets` for param name suggestions
- Aggregates top values per dynamic facet for param value suggestions
