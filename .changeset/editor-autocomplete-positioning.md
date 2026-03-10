---
"cruncher": patch
---

Fix autocomplete dropdown positioning in the query editor.

Replace the manual fixed-position calculation with `@floating-ui/react`, resolving two bugs: the dropdown drifted when the textarea was scrolled horizontally, and Ctrl+Space before typing placed it at the wrong position. The dropdown now also flips above the caret near the bottom of the viewport and shifts horizontally near the edges to stay in view.
