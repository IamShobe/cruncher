---
"cruncher": minor
"@cruncher/qql": patch
"@cruncher/adapter-docker": patch
"@cruncher/adapter-grafana-loki-browser": patch
---

Engine revamped with disk-composed queries: the server process is now a standalone package (`cruncher-server`) with shared types in `@cruncher/server-shared`, enabling better separation of concerns and disk-based query composition.
