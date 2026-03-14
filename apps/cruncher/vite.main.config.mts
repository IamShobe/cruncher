import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config
export default defineConfig(({ mode }) => ({
  plugins: [
    tsconfigPaths({ projects: [resolve(__dirname, "tsconfig.node.json")] }),
    // {
    //     name: "restart",
    //     closeBundle() {
    //         process.stdin.emit("data", "rs");
    //     },
    // },
  ],
  build: {
    sourcemap: mode === "development",
  },
}));
