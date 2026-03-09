---
"@cruncher/qql": patch
---

fix: ASTBuilder no longer throws on incomplete `eval`/`regex` pipeline commands — uses `addError()` + dummy return instead, allowing suggestion collection to proceed and autocomplete to work after typing `| eval` or `| regex` with no expression yet
