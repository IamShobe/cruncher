---
"cruncher": patch
---

Performance improvements to the query editor and TypeScript build.

- Ghost text (autocomplete preview) updates are now deferred with `useDeferredValue` so ArrowUp/ArrowDown through suggestions feels instant while the expensive text-highlight recalculation runs at lower priority.
- Replaced manual `setTimeout`/`clearTimeout` patterns with `useDebouncer` and `useTimeoutFn` from `@tanstack/react-pacer` and `react-use` for cleaner lifecycle management.
- Removed an unused `RefAttributes` intersection on `IconButtonProps` that caused TypeScript to perform 5.6 M type instantiations and consume 4.76 GB of memory, cutting typecheck time from ~43 s to ~8 s and eliminating OOM failures at the default Node.js heap size.
