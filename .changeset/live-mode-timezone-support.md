---
"@cruncher/adapter-utils": minor
"@cruncher/adapter-mock": minor
---

Add timezone-aware formatting and live mode support

- `formatDataTime` and `formatDataTimeShort` now accept an optional `timezone` parameter (`"local"` | `"utc"`), defaulting to `"local"`
- Added `Timezone` type export to `@cruncher/adapter-utils`
- Added optional `id` field to `ProcessedData` type
- Mock adapter now returns a randomized sample of results per query to better simulate live data streams
