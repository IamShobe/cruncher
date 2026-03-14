import { defineConfig } from "vite";
import { dirname, resolve, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import tsconfigPaths from "vite-tsconfig-paths";

const __dirname = dirname(fileURLToPath(import.meta.url));

const MIGRATIONS_SRC = resolve(
  __dirname,
  "src/engineV2/localstate/migrations",
);
const OUT_DIR = process.env.VITE_SERVER_OUT_DIR ?? "dist";
const OUT_DIR_ABS = isAbsolute(OUT_DIR) ? OUT_DIR : resolve(__dirname, OUT_DIR);

export default defineConfig(({ mode }) => ({
  ssr: {
    target: "node",
  },
  plugins: [
    tsconfigPaths({ projects: [resolve(__dirname, "tsconfig.node.json")] }),
    {
      name: "copy-localstate-migrations",
      buildStart() {
        const files = fs.readdirSync(MIGRATIONS_SRC, { recursive: true }) as string[];
        for (const f of files) {
          this.addWatchFile(resolve(MIGRATIONS_SRC, f));
        }
      },
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
        server: resolve(__dirname, "src/main.ts"),
        "duckdb-worker": resolve(
          __dirname,
          "src/engineV2/duckdb/worker.ts",
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
