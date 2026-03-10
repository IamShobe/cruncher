---
name: prepare-release
description: >
  Finalizes and ships changes in the Cruncher monorepo: runs lint, format, tests,
  creates changesets, updates docs, commits, and pushes.
  Use this skill whenever the user says "prepare for release", "finalize changes",
  "create changeset", "ready to ship", "commit and push", "run checks before PR",
  or asks to wrap up a feature/fix with all the standard pre-release steps.
  Even if only one step is mentioned (e.g. "just create the changeset"), consult
  this skill to make sure nothing is skipped.
---

# Cruncher Pre-Release Checklist

Work through these steps in order. Each step must pass before moving on.

---

## 1 — Understand what changed

Read `git diff HEAD` (or the staged diff) across all modified files before doing anything else. You need to know:

- Which **published packages** changed (`packages/qql`, `packages/utils`, `packages/adapters/*`)
- Whether changes are **user-visible** (UI behaviour, new features, bug fixes, API surface)
- What the correct **semver bump** is per package (patch / minor / major)

The Electron app (`cruncher`), docs (`docs-cruncher`), and tools (`cruncher-tools`) are **never published** — they never need a changeset entry.

---

## 2 — Lint

```bash
pnpm lint
```

Runs oxlint over `src/`. Zero warnings, zero errors required. Fix any issues before continuing.

---

## 3 — Format

```bash
pnpm format
```

Runs oxfmt in auto-fix mode. Always run the fixer (not just the checker) so the formatter corrects the files directly. After this, `format:check` must pass cleanly.

---

## 4 — Tests

```bash
pnpm test
```

Vitest in run mode. All tests must pass. If a test fails, fix the root cause — don't skip.

---

## 5 — Typecheck (catches type errors)

```bash
pnpm typecheck
```


---

## 6 — Changesets

Create a changeset only for packages that:
- Live under `packages/` **and** `apps`
- Are actually published to npm (check `.changeset/config.json` → `ignore` list)

Run interactively or write the `.md` file directly in `.changeset/`:

```bash
pnpm changeset
```

### Bump rules
| Change type | Bump |
|---|---|
| New exported API, breaking interface change | `major` |
| New feature, new option, new field added to a type | `minor` |
| Bug fix, internal refactor, perf improvement | `patch` |

### Changeset format

```markdown
---
"@cruncher/adapter-utils": minor
"@cruncher/adapter-mock": patch
---

Short summary of what changed and why it matters to adapter authors / consumers.
Keep it factual and user-focused — not a list of files touched.
```

---

## 7 — Docs

Update docs **only for user-visible changes**. Skip entirely if the change is internal-only (refactor, perf, test data, internal types).

Docs live in `docs/src/content/docs/`:
- `getting-started/` — UI behaviour, settings, keyboard shortcuts, live mode
- `adapters/<name>.mdx` — adapter-specific config or behaviour changes
- `qql-reference/` — QQL language or function changes

### Rules for good doc updates
- Write for the **user**, not the implementer. Explain what changed from their perspective.
- Be concise. Add or update only the paragraphs that cover the new behaviour.
- Reuse existing Astro components (`ParamItem`, `FunctionCard`, `AdapterCard`, `CommandCard`, `ConfigField`) — don't invent new HTML.
- Make the docs look nice - create new components if there's no matching component - that you think will look good.
- Use Starlight CSS variables (`var(--sl-color-*)`) if custom styling is needed.
- Never document internal implementation details (cache structure, engine internals, etc.).

---

## 8 — Commit

Stage only the files that belong to this change. Commit with a clear message that follows this pattern:

```
<type>(<scope>): <short summary>

<body — what changed and why, organized by area if the change is large>
```

Common types: `feat`, `fix`, `perf`, `refactor`, `docs`, `chore`.

**Never add `Co-Authored-By: Claude` lines.** Never use `--no-verify`.

---

## 9 — Push

```bash
git push origin main
```

If the push is rejected (branch protection, required checks), tell the user rather than force-pushing.
