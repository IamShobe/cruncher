---
"cruncher-server": patch
---

Fix pipeline execution and row count accuracy: use uuidv7 for sortable row IDs, compute row count from actual pipeline results, defer parquet writes for immediate availability, and fix histogram to use pipeline result path.
