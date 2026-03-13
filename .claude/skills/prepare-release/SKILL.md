---
name: prepare-release
description: >
  Finalizes and ships changes in the Cruncher monorepo: pulls latest main,
  creates a feature branch, runs lint/format/tests/typecheck, creates changesets,
  updates docs, commits, opens a PR, and waits for CI to pass.
  Use this skill whenever the user says "prepare for release", "finalize changes",
  "create changeset", "ready to ship", "open a PR", "run checks before PR",
  or asks to wrap up a feature/fix with all the standard pre-release steps.
  Even if only one step is mentioned (e.g. "just create the changeset"), consult
  this skill to make sure nothing is skipped.
---

# Cruncher Pre-Release Checklist

Work through these steps in order. Each step must pass before moving on.

---

## 1 — Sync with main

Make sure local main is up to date and create a feature branch for the change:

```bash
git checkout main
git pull origin main
```

Then create a branch named after the change (use the type and short scope from the eventual commit message):

```bash
git checkout -b <type>/<short-description>
# e.g. feat/fuzzy-autocomplete  or  fix/shadow-dom-outside-detector
```

If you are already on a non-main branch with uncommitted work, stash it first (`git stash`), sync main, create the branch from main, then pop (`git stash pop`).

---

## 2 — Understand what changed

Read `git diff HEAD` (or the staged diff) across all modified files before doing anything else. You need to know:

- Which **published packages** changed (`packages/qql`, `packages/utils`, `packages/adapters/*`)
- Whether changes are **user-visible** (UI behaviour, new features, bug fixes, API surface)
- What the correct **semver bump** is per package (patch / minor / major)

The Electron app (`cruncher`), docs (`docs-cruncher`), and tools (`cruncher-tools`) are **never published** — they never need a changeset entry.

---

## 3 — Code review

Read the full diff. Make sure everything is as elegant and optimised as possible.
**If you detect something wrong — immediately report it to the user and stop. Do not continue to the next step.**
Suggest concrete improvements and wait for the user's go-ahead before proceeding.

---

## 4 — Lint

```bash
pnpm lint
```

Runs oxlint over `src/`. Zero warnings, zero errors required. Fix any issues before continuing.

---

## 5 — Format

```bash
pnpm format
```

Runs oxfmt in auto-fix mode. Always run the fixer (not just the checker) so the formatter corrects the files directly. After this, `format:check` must pass cleanly.

---

## 6 — Tests

```bash
pnpm test
```

Vitest in run mode. All tests must pass. If a test fails, fix the root cause — don't skip.

---

## 7 — Typecheck

```bash
pnpm typecheck
```

Zero type errors required across all packages.

---

## 8 — Changesets

Create a changeset for **any** of these:
- Packages under `packages/` that are published to npm
- **`cruncher`** (`apps/cruncher`) — the Electron app always needs a changeset when it changes. Even though it is private and not published to npm, the version bump triggers the Electron build in CI via the `electron-version-changed` workflow output.

Packages that **never** need a changeset: `cruncher-tools`, `docs-cruncher` (both in the `ignore` list in `.changeset/config.json`).

Write the `.md` file directly in `.changeset/` or run interactively:

```bash
pnpm changeset
```

### Bump rules
| Change type                                        | Bump    |
|----------------------------------------------------|---------|
| New exported API, breaking interface change        | `major` |
| New feature, new option, new field added to a type | `minor` |
| Bug fix, internal refactor, perf improvement       | `patch` |

### Changeset format

For the Electron app:
```markdown
---
"cruncher": minor
---

Short user-facing summary. What the user sees or can do now.
```

For published packages:
```markdown
---
"@cruncher/adapter-utils": minor
"@cruncher/adapter-mock": patch
---

Short summary of what changed and why it matters to adapter authors / consumers.
Keep it factual and user-focused — not a list of files touched.
```

---

## 9 — Docs

Update docs **only for user-visible changes** — especially the Cruncher app at `apps/cruncher/`. Skip entirely if the change is internal-only (refactor, perf, test data, internal types).

Docs live in `docs/src/content/docs/`:
- `getting-started/` — UI behaviour, settings, keyboard shortcuts, live mode
- `adapters/<name>.mdx` — adapter-specific config or behaviour changes
- `qql-reference/` — QQL language or function changes

### Rules for good doc updates
- Write for the **user**, not the implementer. Explain what changed from their perspective.
- Be concise. Add or update only the paragraphs that cover the new behaviour.
- Reuse existing Astro components (`ParamItem`, `FunctionCard`, `AdapterCard`, `CommandCard`, `ConfigField`) — don't invent new HTML.
- Create a new component if none of the existing ones fit and it will look good.
- Use Starlight CSS variables (`var(--sl-color-*)`) if custom styling is needed.
- Never document internal implementation details (cache structure, engine internals, etc.).

---

## 10 — Commit

Stage only the files that belong to this change. Commit with a clear message that follows this pattern:

```
<type>(<scope>): <short summary>

<body — what changed and why, organized by area if the change is large>
```

Common types: `feat`, `fix`, `perf`, `refactor`, `docs`, `chore`.

**Never add `Co-Authored-By: Claude` lines.** Never use `--no-verify`.

---

## 11 — Push and open PR

Push the branch and open a pull request against `main`:

```bash
git push -u origin <branch-name>
gh pr create --base main --title "<type>(<scope>): <short summary>" --body "$(cat <<'EOF'
## Summary
<bullet points — what changed and why>

## Test plan
- [ ] lint / format / tests / typecheck all pass (CI)
- [ ] <any manual verification steps>
EOF
)"
```

Return the PR URL to the user.

---

## 12 — Wait for CI

Poll CI until all required checks pass:

```bash
gh pr checks <pr-number> --watch
```

- If checks pass → report success to the user. The PR is ready to merge.
- If a check fails → read the failure output, fix the root cause, push a new commit, and re-watch.

Do **not** merge the PR yourself unless the user explicitly asks.