import { defineConfig } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    // {
    //     name: "restart",
    //     closeBundle() {
    //         process.stdin.emit("data", "rs");
    //     },
    // },
  ],
  build: {
    // target: "node22",
    lib: {
      entry: resolve(__dirname, "src/processes/server/main.ts"),
      name: "main-server",
      formats: ["cjs"],
      fileName: () => "server.js",
    },
    sourcemap: true,
    rollupOptions: {
      external: ["node:process", "node:events", "child_process"],
    },
  },
});
