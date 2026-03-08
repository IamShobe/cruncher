---
"cruncher": minor
"@cruncher/adapter-utils": minor
"@cruncher/adapter-mock": minor
"@cruncher/adapter-k8s": patch
"@cruncher/qql": patch
---

Add timezone-aware formatting, live mode support, and row identity

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
