import fs from "node:fs";
import path from "node:path";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";

/**
 * Migrations folder is copied next to server.js at build time (see vite.server.config.mts).
 * drizzle-kit generates SQL files into this folder — run `pnpm drizzle-kit generate` after
 * schema changes, then rebuild.
 * Falls back to the source `migrations/` folder when running tests directly from source.
 */
const _builtMigrationsFolder = path.join(__dirname, "localstate-migrations");
const MIGRATIONS_FOLDER = fs.existsSync(_builtMigrationsFolder)
  ? _builtMigrationsFolder
  : path.join(__dirname, "migrations");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function runMigrations(db: BetterSQLite3Database<typeof schema>): void {
  process.stderr.write(`[migrations] running from: ${MIGRATIONS_FOLDER}\n`);
  try {
    migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
    process.stderr.write(`[migrations] completed successfully\n`);
  } catch (err) {
    process.stderr.write(
      `[migrations] FAILED: ${err instanceof Error ? `${err.message}\n${err.stack}` : String(err)}\n`,
    );
    throw err;
  }
}
