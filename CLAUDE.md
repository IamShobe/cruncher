# Claude.md - Cruncher Development Guide

## Project Overview
Cruncher is a Turborepo-based monorepo containing:
- **Packages**: `@cruncher/qql` (query language), `@cruncher/adapter-*` (data adapters), `@cruncher/utils`
- **App**: `apps/cruncher` (Electron app, not published)
- **Docs**: `docs/` (Astro-based, not published)
- **Tools**: `tools/` (utilities, not published)

## Build & Release
- Uses **Changesets** for versioning and releases
- **OIDC trusted publishing** to npm (no NPM_TOKEN needed)
- Electron app releases automatically when `apps/cruncher` version is bumped by a changeset
- `.changeset/config.json` ignores: `cruncher-tools`, `docs-cruncher` — **`cruncher` (Electron app) is NOT ignored and needs a changeset when it changes**
- **Whenever `cruncher-server` changes, always include `cruncher` in the same changeset too** (`"cruncher": patch` or appropriate bump) — `cruncher` depends on `cruncher-server`, so a server change means the Electron app needs a version bump to trigger its auto-release
- Local testing: `pnpm local-registry` + `pnpm release:local`

## Code Style & Conventions

### Colors & Styling
- **Always use the `token()` function** from `~components/ui/system` for theme values
- Use `token()` in styled components and css props: `background-color: ${token("colors.bg")};`
- Common token paths: `colors.bg`, `colors.border`, `colors.fg.muted`, `spacing.*`, `radii.lg`, `radii.md`
- Example:
  ```typescript
  import styled from "@emotion/styled";
  import { token } from "~components/ui/system";

  const MyComponent = styled.div`
    background-color: ${token("colors.bg")};
    padding: ${token("spacing.4")};
    border-radius: ${token("radii.lg")};
  `;
  ```
- Never hardcode hex colors or custom values
- Prefer styled components over inline css props for reusable styles

### Git Commits
- **Never add `Co-Authored-By: Claude` watermarks** to commits
- Prefer creating new commits over amending
- Include OIDC-safe npm auth configuration in release workflows

### TypeScript & Building
- Parser refactored from Chevrotain to ANTLR4 (recent change)
- Uses `tsconfig.modules.json` with `"module": "esnext"` for ESM output
- Type-safe adapters with Zod schema validation
- Always compile packages before testing with Electron app

### Components & Error Handling
- Use **Chakra UI v3** components (not v2)
- Wrap content areas with `ErrorBoundary` to catch parser/rendering errors gracefully
- Error boundary should use existing theme colors and tokens
- QQL parser errors (lexing/parsing) are automatically formatted in error messages

## Migrations
- **Never manually edit** `apps/cruncher/src/processes/server/engineV2/localstate/migrations/meta/_journal.json` — managed exclusively by drizzle-kit
- Only create SQL migration files in the `migrations/` folder; run `pnpm drizzle-kit generate` to let drizzle-kit update the journal automatically

## Preferred CLI tools (via `.mise.toml`)
- **`ast-grep`** — AST-aware structural code search/transforms; prefer over `rg` for code patterns (function signatures, imports, specific constructs)
- **`fd`** — fast file finder
- **`yq`** — YAML/JSON processor (like `jq`, for YAML) — use for config files (`.changeset/config.json`, `pnpm-lock.yaml`, etc.)
- **`difftastic`** — syntax-aware structural diffs
- **`shellcheck`** — lint any `.sh` scripts before committing
- **`watchexec`** — file watcher for running commands on change
- **`hyperfine`** — CLI benchmarking

## Common Issues & Solutions

### Empty dist/index.js in adapters
- **Cause**: Corrupted turbo cache
- **Fix**: `rm -rf .turbo packages/adapters/*/dist && pnpm build`

### QQL Parser errors crashing page
- **Solution**: Wrap affected components with `ErrorBoundary` component
- Already implemented in `__root.tsx`
- Errors are logged to toast notifications and displayed with full context

### Vite module resolution issues
- Clear vite cache: `rm -rf apps/cruncher/.vite-deps`
- Rebuild packages: `pnpm build`
- Restart dev server

## Useful Scripts
```bash
pnpm prepare-pr          # Create changeset before PR
pnpm build              # Build all packages
pnpm serve              # Start Electron dev server
pnpm local-registry     # Start Verdaccio for local testing
pnpm release:local      # Test full release pipeline
```

## Directory Structure
```
cruncher/
├── packages/
│   ├── qql/                    # Query language parser (ANTLR4)
│   ├── utils/                  # Shared utilities
│   ├── adapters/
│   │   ├── coralogix/
│   │   ├── docker/
│   │   ├── k8s/
│   │   ├── loki/
│   │   ├── mocked-data/        # @cruncher/adapter-mock
│   │   └── utils/              # Adapter base utilities
│   └── (other packages)
├── apps/
│   └── cruncher/               # Electron app
│       └── src/processes/frontend/
│           └── components/ErrorBoundary.tsx
├── docs/                       # Astro docs site
├── .changeset/                 # Changeset config
└── tsconfig.*.json            # Shared TypeScript configs
```
