#!/usr/bin/env node
/**
 * Run vitest inside Electron's Node.js runtime so that native addons compiled
 * against Electron's ABI (e.g. better-sqlite3) work correctly in tests.
 *
 * Usage: node scripts/electron-vitest.mjs [vitest args...]
 * e.g.:  node scripts/electron-vitest.mjs run
 *        node scripts/electron-vitest.mjs run --reporter=verbose
 */
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, "..");

// Resolve 'electron' from the monorepo root (where electron is installed).
const requireRoot = createRequire(resolve(rootDir, "package.json"));
const electronBin = requireRoot("electron");

// Resolve vitest from the calling package's working directory.
const requireCwd = createRequire(resolve(process.cwd(), "package.json"));
const vitestPkg = requireCwd.resolve("vitest/package.json");
const vitestMjs = resolve(dirname(vitestPkg), "vitest.mjs");

execFileSync(electronBin, [vitestMjs, ...process.argv.slice(2)], {
  env: { ...process.env, ELECTRON_RUN_AS_NODE: "1" },
  stdio: "inherit",
  cwd: process.cwd(),
});
