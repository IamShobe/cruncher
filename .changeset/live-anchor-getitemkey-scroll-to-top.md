---
"cruncher": minor
---

Fix live mode scroll anchor movement when expanded log details are visible. TanStack Virtual's item size cache is now keyed by log ID instead of index, so measurements survive prepends without ResizeObserver corrections causing visible jumps.

Add a "Scroll to top" button that appears in the top-right corner of the log view when scrolled down.
