import { defineConfig } from "vite";
import { dirname, resolve, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

import tsconfigPaths from "vite-tsconfig-paths";

const MIGRATIONS_SRC = resolve(
  __dirname,
  "src/processes/server/engineV2/localstate/migrations",
);
const OUT_DIR = process.env.VITE_SERVER_OUT_DIR ?? ".vite/build";
const OUT_DIR_ABS = isAbsolute(OUT_DIR) ? OUT_DIR : resolve(__dirname, OUT_DIR);

// https://vitejs.dev/config
export default defineConfig(({ mode }) => ({
  ssr: {
    target: "node",
  },
  plugins: [
    tsconfigPaths({ projects: [resolve(__dirname, "tsconfig.node.json")] }),
    {
      // Copy Drizzle migration files next to server.js so migrate() can find them at runtime.
      name: "copy-localstate-migrations",
      // Watch all SQL migration files so that adding a new migration triggers a
      // server rebuild (and re-copy) automatically in dev mode.
      buildStart() {
        const files = fs.readdirSync(MIGRATIONS_SRC, { recursive: true }) as string[];
        for (const f of files) {
          this.addWatchFile(resolve(MIGRATIONS_SRC, f));
        }
      },
      // Use buildEnd (runs before the bundle is written to disk) so that
      // migration files are in place before chokidar detects the new server.js
      // and restarts the server process. closeBundle runs too late and loses
      // the race with the server restart.
      buildEnd() {
        const dest = resolve(OUT_DIR_ABS, "localstate-migrations");
        fs.cpSync(MIGRATIONS_SRC, dest, { recursive: true });
      },
    },
  ],
  build: {
    ssr: true,
    outDir: OUT_DIR_ABS,
    emptyOutDir: false,
    lib: {
      entry: {
        server: resolve(__dirname, "src/processes/server/main.ts"),
        "duckdb-worker": resolve(
          __dirname,
          "src/processes/server/engineV2/duckdb/worker.ts",
        ),
      },
      formats: ["cjs"],
      fileName: (_, entryName) => `${entryName}.js`,
    },
    sourcemap: mode === "development",
    rollupOptions: {
      external: [
        "node:process",
        "node:events",
        "node:worker_threads",
        "child_process",
        "@duckdb/node-api",
        "better-sqlite3",
      ],
    },
  },
}));
