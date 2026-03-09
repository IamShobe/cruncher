---
"@cruncher/adapter-utils": minor
"@cruncher/adapter-datadog": patch
"@cruncher/adapter-mock": minor
---

feat: log row expand/collapse, batched streaming, and connector status UI

### adapter-utils
- Added `isLiveQuery: boolean` to `QueryOptions` to distinguish live polling from initial data loads

### adapter-mock
- Initial queries now stream data in batches of 2000 events (up to 10 k) for a more realistic experience
- Live polling returns only 1–10 new events per tick (matching real adapter behaviour)
- Added long-message test entries so the line-clamp / "show more" UI can be tested without a real backend

### adapter-datadog
- Removed incorrect post-processing that dropped empty facets from `getControllerParams` results
