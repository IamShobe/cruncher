## 0.3.1

### Patch Changes

- [`3cd20aa`](https://github.com/IamShobe/cruncher/commit/3cd20aadc4ac3e9a70f15ed542a78e7a36c58059) Thanks [@IamShobe](https://github.com/IamShobe)! - Fix three bugs in QQL parser:
  - `isNumeric`: unescaped dot in regex caused strings like `123a456` to be misclassified as numeric
  - `getNextPos`: could return `undefined` at EOF, corrupting autocomplete suggestion ranges with `NaN`
  - `remove()`: `splice(indexOf(...), 1)` with a -1 result silently removed an unrelated suggestion from the list

## 0.3.0

### Minor Changes

- [#17](https://github.com/IamShobe/cruncher/pull/17) [`c2b248c`](https://github.com/IamShobe/cruncher/commit/c2b248c10816d9f184654d78db9087771521789f) Thanks [@IamShobe](https://github.com/IamShobe)! - Migrate to Turborepo, new CI pipeline, new linter, and various enhancements

## 0.2.4 (2025-06-21)

### 🩹 Fixes

- created new standard for adapters - and new codegen for it ([#15](https://github.com/IamShobe/cruncher/pull/15))

## 0.2.3 (2025-06-21)

### 🩹 Fixes

- Update ci stuff ([#13](https://github.com/IamShobe/cruncher/pull/13))

## 0.2.2 (2025-06-21)

### 🩹 Fixes

- test bump ([5d62e3c](https://github.com/IamShobe/cruncher/commit/5d62e3c))

## 0.2.1 (2025-06-21)

### 🩹 Fixes

- new release flow ([e9ace0d](https://github.com/IamShobe/cruncher/commit/e9ace0d))

## 0.2.0 (2025-06-21)

### 🚀 Features

- nx initial commit ([883376b](https://github.com/IamShobe/cruncher/commit/883376b))
