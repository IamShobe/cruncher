import { defineConfig } from "vite";

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
    lib: {
      entry: "src/processes/server/main.ts",
      name: "main-server",
      formats: ["cjs"],
      fileName: () => "server.js",
    },
    sourcemap: true,
  },
});
