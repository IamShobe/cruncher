import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(appRoot, "..", "..");
const serverDir = path.join(appRoot, "resources", "server");
const pruneDir = path.join(repoRoot, ".turbo", "prune", "cruncher-server");
const fast =
  process.env.FAST === "1" ||
  process.env.FAST === "true" ||
  process.argv.includes("--fast");

const run = (cmd, args, opts = {}) => {
  const result = spawnSync(cmd, args, {
    cwd: appRoot,
    stdio: "inherit",
    ...opts,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const serverSrcDir = path.resolve(appRoot, "..", "cruncher-server");
const hasNodeModules = fs.existsSync(path.join(serverDir, "node_modules"));

run(
  "pnpm",
  ["--filter=cruncher-server", "build"],
  { cwd: repoRoot },
);

if (!fast || !hasNodeModules) {
  fs.rmSync(serverDir, { recursive: true, force: true });

  if (!fast || !fs.existsSync(pruneDir)) {
    fs.rmSync(pruneDir, { recursive: true, force: true });
    run(
      "pnpm",
      ["turbo", "prune", "cruncher-server", "--out-dir", pruneDir],
      { cwd: repoRoot },
    );
  }

  const prunedLockPath = path.join(pruneDir, "pnpm-lock.yaml");
  const hasPrunedLock = fs.existsSync(prunedLockPath);
  const prunedLockIncludesRuntime =
    hasPrunedLock &&
    fs
      .readFileSync(prunedLockPath, "utf8")
      .includes("apps/cruncher-server:");

  const deployCwd = prunedLockIncludesRuntime ? pruneDir : repoRoot;
  if (!prunedLockIncludesRuntime) {
    console.warn(
      "[prepare-server-runtime] Pruned lockfile missing cruncher-server; falling back to root deploy.",
    );
  }

  run(
    "pnpm",
    ["--filter=cruncher-server", "--prod", "deploy", serverDir],
    { cwd: deployCwd },
  );

  const deployedLock = path.join(serverDir, "pnpm-lock.yaml");
  if (fs.existsSync(deployedLock)) {
    fs.rmSync(deployedLock, { force: true });
  }

  // pnpm deploy doesn't copy built dist from workspace source; copy it manually
  const distSrc = path.join(serverSrcDir, "dist");
  const distDest = path.join(serverDir, "dist");
  fs.cpSync(distSrc, distDest, { recursive: true });
}

const pnpmStore = path.join(serverDir, "node_modules", ".pnpm");
let hasBetterSqliteBinary = false;
if (fs.existsSync(pnpmStore)) {
  const entries = fs.readdirSync(pnpmStore, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (!entry.name.startsWith("better-sqlite3@")) continue;
    const binPath = path.join(
      pnpmStore,
      entry.name,
      "node_modules",
      "better-sqlite3",
      "build",
      "Release",
      "better_sqlite3.node",
    );
    if (fs.existsSync(binPath)) {
      hasBetterSqliteBinary = true;
      break;
    }
  }
}

if (!fast || !hasBetterSqliteBinary) {
  run("electron-rebuild", [
    "--module-dir",
    "resources/server",
    "--only",
    "better-sqlite3,@duckdb/node-api",
    "--force",
  ]);
}
