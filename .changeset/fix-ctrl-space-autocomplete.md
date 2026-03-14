---
"cruncher": patch
---

Fix Ctrl+Space autocomplete so it stays open while typing and can be triggered mid-word. Previously, opening autocomplete with Ctrl+Space would close as soon as you typed a character, and pressing Ctrl+Space after partially typing a word (e.g. "app_c") showed no suggestions. Now the completer remains open, filtering results with fuzzy matching as you type, and closes naturally on space, newline, Escape, or accepting a completion.
