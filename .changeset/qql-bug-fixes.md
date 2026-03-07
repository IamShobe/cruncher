---
"@cruncher/qql": patch
---

Fix three bugs in QQL parser:
- `isNumeric`: unescaped dot in regex caused strings like `123a456` to be misclassified as numeric
- `getNextPos`: could return `undefined` at EOF, corrupting autocomplete suggestion ranges with `NaN`
- `remove()`: `splice(indexOf(...), 1)` with a -1 result silently removed an unrelated suggestion from the list
