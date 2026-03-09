---
"@cruncher/qql": patch
"@cruncher/adapter-coralogix": patch
"@cruncher/adapter-datadog": patch
"@cruncher/adapter-utils": patch
---

Code quality fixes: resolve typecheck errors, lint warnings, and formatting

- `@cruncher/qql`: Fix `EvalCmd.expression` and `RegexCmd.pattern` types from nullable to required; ASTBuilder now throws on missing contexts instead of silently returning null; remove unused imports and variables
- `@cruncher/adapter-coralogix`: Fix import extensions to use `.js` suffix for node16 module resolution compatibility
- `@cruncher/adapter-datadog`: Apply consistent code formatting
- `@cruncher/adapter-utils`: Apply consistent code formatting
