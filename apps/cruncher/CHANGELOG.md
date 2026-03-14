## 2.4.1

### Patch Changes

- [#40](https://github.com/IamShobe/cruncher/pull/40) [`0d1de8c`](https://github.com/IamShobe/cruncher/commit/0d1de8c17d38c88d6af12148addd5f66e1e3163d) Thanks [@yarinba](https://github.com/yarinba)! - Fix Ctrl+Space autocomplete so it stays open while typing and can be triggered mid-word. Previously, opening autocomplete with Ctrl+Space would close as soon as you typed a character, and pressing Ctrl+Space after partially typing a word (e.g. "app_c") showed no suggestions. Now the completer remains open, filtering results with fuzzy matching as you type, and closes naturally on space, newline, Escape, or accepting a completion.

## 2.4.0

### Minor Changes

- [#41](https://github.com/IamShobe/cruncher/pull/41) [`73a494e`](https://github.com/IamShobe/cruncher/commit/73a494e4f16d067dcc82100ac29fa2dcf2e77a4d) Thanks [@IamShobe](https://github.com/IamShobe)! - Engine revamped with disk-composed queries: the server process is now a standalone package (`cruncher-server`) with shared types in `@cruncher/server-shared`, enabling better separation of concerns and disk-based query composition.

### Patch Changes

- Updated dependencies [[`73a494e`](https://github.com/IamShobe/cruncher/commit/73a494e4f16d067dcc82100ac29fa2dcf2e77a4d)]:
  - @cruncher/qql@0.4.5
  - @cruncher/adapter-utils@0.5.2
  - @cruncher/server-shared@0.1.1

## 2.3.0

### Minor Changes

- [#37](https://github.com/IamShobe/cruncher/pull/37) [`00f8b43`](https://github.com/IamShobe/cruncher/commit/00f8b43f95a63c000fa36d363eac66e661f910d4) Thanks [@IamShobe](https://github.com/IamShobe)! - Autocomplete now uses fuzzy matching — suggestions appear even when you type non-contiguous characters, with matched characters highlighted in the dropdown. The token hint tooltip arrow now automatically flips direction when the card appears above the cursor (near the top of the viewport).

- [#39](https://github.com/IamShobe/cruncher/pull/39) [`333577b`](https://github.com/IamShobe/cruncher/commit/333577b5f587c87138fe4a2218795656d42b7d33) Thanks [@IamShobe](https://github.com/IamShobe)! - Fix live mode scroll anchor movement when expanded log details are visible. TanStack Virtual's item size cache is now keyed by log ID instead of index, so measurements survive prepends without ResizeObserver corrections causing visible jumps.

  Add a "Scroll to top" button that appears in the top-right corner of the log view when scrolled down.

### Patch Changes

- [#39](https://github.com/IamShobe/cruncher/pull/39) [`333577b`](https://github.com/IamShobe/cruncher/commit/333577b5f587c87138fe4a2218795656d42b7d33) Thanks [@IamShobe](https://github.com/IamShobe)! - Fix sticky row header overlap when scrolling through expanded log details. Open log headers now correctly pin to the top of the viewport while their details are visible, and scroll away cleanly once the section leaves view.

## 2.2.0

### Minor Changes

- [`d3912fe`](https://github.com/IamShobe/cruncher/commit/d3912fe3522787ba7ba9551e00df5b1848e89258) Thanks [@IamShobe](https://github.com/IamShobe)! - Add customizable keybindings settings (Settings → Keybindings).

  Users can now override any keyboard shortcut directly from the UI. Click a key badge to record a new combo, choose whether to save it to the local config (`cruncher.config.local.yaml`) or the shared global config, and see a source badge (Local / Global) next to any overridden binding. The × icon resets individual overrides; Reset All clears every override at once. Overrides take effect immediately across all shortcut handlers and tooltips — no restart required.

### Patch Changes

- [`d3912fe`](https://github.com/IamShobe/cruncher/commit/d3912fe3522787ba7ba9551e00df5b1848e89258) Thanks [@IamShobe](https://github.com/IamShobe)! - Fix autocomplete dropdown positioning in the query editor.

  Replace the manual fixed-position calculation with `@floating-ui/react`, resolving two bugs: the dropdown drifted when the textarea was scrolled horizontally, and Ctrl+Space before typing placed it at the wrong position. The dropdown now also flips above the caret near the bottom of the viewport and shifts horizontally near the edges to stay in view.

- [`d3912fe`](https://github.com/IamShobe/cruncher/commit/d3912fe3522787ba7ba9551e00df5b1848e89258) Thanks [@IamShobe](https://github.com/IamShobe)! - Performance improvements to the query editor and TypeScript build.
  - Ghost text (autocomplete preview) updates are now deferred with `useDeferredValue` so ArrowUp/ArrowDown through suggestions feels instant while the expensive text-highlight recalculation runs at lower priority.
  - Replaced manual `setTimeout`/`clearTimeout` patterns with `useDebouncer` and `useTimeoutFn` from `@tanstack/react-pacer` and `react-use` for cleaner lifecycle management.
  - Removed an unused `RefAttributes` intersection on `IconButtonProps` that caused TypeScript to perform 5.6 M type instantiations and consume 4.76 GB of memory, cutting typecheck time from ~43 s to ~8 s and eliminating OOM failures at the default Node.js heap size.

- Updated dependencies [[`069e9dd`](https://github.com/IamShobe/cruncher/commit/069e9ddf615ed4cde05d838108e152dccb5b97b7)]:
  - @cruncher/qql@0.4.4
  - @cruncher/adapter-coralogix@0.3.6
  - @cruncher/adapter-datadog@0.2.3
  - @cruncher/adapter-docker@0.3.6
  - @cruncher/adapter-grafana-loki-browser@0.3.6
  - @cruncher/adapter-k8s@0.2.5
  - @cruncher/adapter-loki@0.2.6
  - @cruncher/adapter-mock@0.5.1
  - @cruncher/adapter-utils@0.5.1

## 2.1.3

### Patch Changes

- Updated dependencies [[`127cf8d`](https://github.com/IamShobe/cruncher/commit/127cf8d2cc13e77fdde59f7b5b1c027df0a61cea), [`127cf8d`](https://github.com/IamShobe/cruncher/commit/127cf8d2cc13e77fdde59f7b5b1c027df0a61cea), [`9ca2116`](https://github.com/IamShobe/cruncher/commit/9ca211603b87ca75a6d7b96b51ae321e2dd98f1d)]:
  - @cruncher/adapter-datadog@0.2.2
  - @cruncher/qql@0.4.3
  - @cruncher/adapter-utils@0.5.0
  - @cruncher/adapter-mock@0.5.0
  - @cruncher/adapter-coralogix@0.3.5
  - @cruncher/adapter-docker@0.3.5
  - @cruncher/adapter-grafana-loki-browser@0.3.5
  - @cruncher/adapter-k8s@0.2.4
  - @cruncher/adapter-loki@0.2.5

## 2.1.2

### Patch Changes

- Updated dependencies [[`5146558`](https://github.com/IamShobe/cruncher/commit/51465584e2584714ae1d8929d96e0ddd2cda4594)]:
  - @cruncher/qql@0.4.2
  - @cruncher/adapter-coralogix@0.3.4
  - @cruncher/adapter-datadog@0.2.1
  - @cruncher/adapter-utils@0.4.1
  - @cruncher/adapter-docker@0.3.4
  - @cruncher/adapter-grafana-loki-browser@0.3.4
  - @cruncher/adapter-k8s@0.2.3
  - @cruncher/adapter-loki@0.2.4
  - @cruncher/adapter-mock@0.4.1

## 2.1.1

### Patch Changes

- Updated dependencies [[`52d3af6`](https://github.com/IamShobe/cruncher/commit/52d3af6648fed1e7623a61781e97169856440fd3)]:
  - @cruncher/adapter-datadog@0.2.0

## 2.1.0

### Minor Changes

- [`f8ee20b`](https://github.com/IamShobe/cruncher/commit/f8ee20bc9eb660b73dfca7ad3a3215abee73a122) Thanks [@IamShobe](https://github.com/IamShobe)! - Add timezone-aware formatting, live mode support, and row identity

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

### Patch Changes

- Updated dependencies [[`f8ee20b`](https://github.com/IamShobe/cruncher/commit/f8ee20bc9eb660b73dfca7ad3a3215abee73a122)]:
  - @cruncher/adapter-utils@0.4.0
  - @cruncher/adapter-mock@0.4.0
  - @cruncher/adapter-k8s@0.2.2
  - @cruncher/qql@0.4.1
  - @cruncher/adapter-coralogix@0.3.3
  - @cruncher/adapter-docker@0.3.3
  - @cruncher/adapter-grafana-loki-browser@0.3.3
  - @cruncher/adapter-loki@0.2.3

## 2.0.0

### Major Changes

- [`c8060e6`](https://github.com/IamShobe/cruncher/commit/c8060e6eb1e610273bded9d7c43628d843848047) Thanks [@IamShobe](https://github.com/IamShobe)! - Complete refactor for QQL engine + much better highlight and autocomplete engines

### Patch Changes

- Updated dependencies [[`c8060e6`](https://github.com/IamShobe/cruncher/commit/c8060e6eb1e610273bded9d7c43628d843848047)]:
  - @cruncher/qql@0.4.0
  - @cruncher/adapter-coralogix@0.3.2
  - @cruncher/adapter-docker@0.3.2
  - @cruncher/adapter-grafana-loki-browser@0.3.2
  - @cruncher/adapter-k8s@0.2.1
  - @cruncher/adapter-loki@0.2.2
  - @cruncher/adapter-mock@0.3.2
  - @cruncher/adapter-utils@0.3.2

## 1.8.0

### Minor Changes

- [`c46201a`](https://github.com/IamShobe/cruncher/commit/c46201a76b728383513c7e919432a63e3aa0a7ed) Thanks [@IamShobe](https://github.com/IamShobe)! - Add multi-theme support (Midnight, Nord, Dracula, Catppuccin Mocha) with theme picker in Settings → General. Theme preference is persisted via localStorage and applied via CSS variable overrides scoped to the shadow DOM.

### Patch Changes

- Updated dependencies [[`111ec6b`](https://github.com/IamShobe/cruncher/commit/111ec6b488abbec0cf95c3b9df9726155edd5dad), [`3cd20aa`](https://github.com/IamShobe/cruncher/commit/3cd20aadc4ac3e9a70f15ed542a78e7a36c58059)]:
  - @cruncher/adapter-k8s@0.2.0
  - @cruncher/qql@0.3.1
  - @cruncher/adapter-coralogix@0.3.1
  - @cruncher/adapter-docker@0.3.1
  - @cruncher/adapter-grafana-loki-browser@0.3.1
  - @cruncher/adapter-loki@0.2.1
  - @cruncher/adapter-mock@0.3.1
  - @cruncher/adapter-utils@0.3.1

## 1.7.1

### Patch Changes

- Updated dependencies [[`c2b248c`](https://github.com/IamShobe/cruncher/commit/c2b248c10816d9f184654d78db9087771521789f)]:
  - @cruncher/qql@0.3.0
  - @cruncher/utils@0.3.0
  - @cruncher/adapter-coralogix@0.3.0
  - @cruncher/adapter-docker@0.3.0
  - @cruncher/adapter-grafana-loki-browser@0.3.0
  - @cruncher/adapter-loki@0.2.0
  - @cruncher/adapter-mock@0.3.0
  - @cruncher/adapter-utils@0.3.0

## 1.7.0 (2025-06-28)

### 🚀 Features

- Support loki adapter ([#16](https://github.com/IamShobe/cruncher/pull/16))

### 🧱 Updated Dependencies

- Updated @cruncher/adapter-grafana-loki-browser to 0.2.5
- Updated @cruncher/adapter-docker to 0.2.5
- Updated @cruncher/adapter-loki to 0.1.0

## 1.6.9 (2025-06-21)

### 🧱 Updated Dependencies

- Updated @cruncher/adapter-grafana-loki-browser to 0.2.4
- Updated @cruncher/adapters-mock to 0.2.4
- Updated @cruncher/adapter-coralogix to 0.2.4
- Updated @cruncher/adapter-docker to 0.2.4
- Updated @cruncher/adapters-utils to 0.2.4
- Updated @cruncher/utils to 0.2.4
- Updated @cruncher/qql to 0.2.4

## 1.6.8 (2025-06-21)

### 🩹 Fixes

- fix broken build ([#14](https://github.com/IamShobe/cruncher/pull/14))

### 🧱 Updated Dependencies

- Updated @cruncher/adapter-grafana-loki-browser to 0.2.3
- Updated @cruncher/adapters-mock to 0.2.3
- Updated @cruncher/adapter-coralogix to 0.2.3
- Updated @cruncher/adapter-docker to 0.2.3
- Updated @cruncher/adapters-utils to 0.2.3

## 1.6.7 (2025-06-21)

### 🩹 Fixes

- Update ci stuff ([#13](https://github.com/IamShobe/cruncher/pull/13))

### 🧱 Updated Dependencies

- Updated @cruncher/adapter-grafana-loki-browser to 0.2.2
- Updated @cruncher/adapters-mock to 0.2.2
- Updated @cruncher/adapter-coralogix to 0.2.2
- Updated @cruncher/adapter-docker to 0.2.2
- Updated @cruncher/adapters-utils to 0.2.2
- Updated @cruncher/utils to 0.2.3
- Updated @cruncher/qql to 0.2.3

## 1.6.6 (2025-06-21)

### 🩹 Fixes

- test release ([c240830](https://github.com/IamShobe/cruncher/commit/c240830))

## 1.6.5 (2025-06-21)

### 🩹 Fixes

- another try ([caaf748](https://github.com/IamShobe/cruncher/commit/caaf748))

## 1.6.4 (2025-06-21)

### 🩹 Fixes

- fix release name ([ff8e5ef](https://github.com/IamShobe/cruncher/commit/ff8e5ef))

## 1.6.3 (2025-06-21)

### 🩹 Fixes

- modify package json ([45877ba](https://github.com/IamShobe/cruncher/commit/45877ba))

## 1.6.2 (2025-06-21)

### 🧱 Updated Dependencies

- Updated @cruncher/adapter-grafana-loki-browser to 0.2.1
- Updated @cruncher/adapters-mock to 0.2.1
- Updated @cruncher/adapter-coralogix to 0.2.1
- Updated @cruncher/adapter-docker to 0.2.1
- Updated @cruncher/adapters-utils to 0.2.1
- Updated @cruncher/utils to 0.2.2
- Updated @cruncher/qql to 0.2.2

## 1.6.1 (2025-06-21)

### 🩹 Fixes

- new release flow ([e9ace0d](https://github.com/IamShobe/cruncher/commit/e9ace0d))

### 🧱 Updated Dependencies

- Updated @cruncher/utils to 0.2.1
- Updated @cruncher/qql to 0.2.1

## 1.6.0 (2025-06-21)

### 🚀 Features

- nx initial commit ([883376b](https://github.com/IamShobe/cruncher/commit/883376b))

### 🧱 Updated Dependencies

- Updated @cruncher/adapter-grafana-loki-browser to 0.2.0
- Updated @cruncher/adapter-mock to 0.2.0
- Updated @cruncher/adapter-coralogix to 0.2.0
- Updated @cruncher/adapter-docker to 0.2.0
- Updated @cruncher/adapter-utils to 0.2.0
- Updated @cruncher/utils to 0.2.0
- Updated @cruncher/qql to 0.2.0
