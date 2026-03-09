---
"@cruncher/adapter-datadog": patch
---

fix: add `indexing_delay_seconds` parameter (default: 30s) to account for Datadog analytics indexing lag, fixing live mode returning no new logs
