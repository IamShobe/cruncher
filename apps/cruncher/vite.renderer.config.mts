import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { devtools } from "@tanstack/devtools-vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = (p: string) => resolve(__dirname, "../..", p);

// https://vitejs.dev/config
export default defineConfig({
  plugins: [
    devtools(),
    tanstackRouter({
      target: "react",
      // autoCodeSplitting: true,
    }),
    tsconfigPaths(),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  resolve: {
    alias: [
      // Subpaths must come before the package root alias
      { find: "@cruncher/qql/grammar",             replacement: pkg("packages/qql/src/grammar.ts") },
      { find: "@cruncher/qql/searchTree",           replacement: pkg("packages/qql/src/searchTree.ts") },
      { find: "@cruncher/qql",                      replacement: pkg("packages/qql/src/index.ts") },
      { find: "@cruncher/adapter-utils/formatters", replacement: pkg("packages/adapters/utils/src/formatters.ts") },
      { find: "@cruncher/adapter-utils/logTypes",   replacement: pkg("packages/adapters/utils/src/logTypes.ts") },
      { find: "@cruncher/adapter-utils",            replacement: pkg("packages/adapters/utils/src/index.ts") },
      { find: "@cruncher/utils",                    replacement: pkg("packages/utils/src/index.ts") },
    ],
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx"],
    dedupe: ["react", "react-dom", "@emotion/react", "react-is"],
  },
  optimizeDeps: {
    exclude: [
      "@cruncher/utils",
      "@cruncher/qql",
      "@cruncher/adapter-utils",
      "@cruncher/adapter-loki",
      "@cruncher/adapter-coralogix",
      "@cruncher/adapter-docker",
      "@cruncher/adapter-mock",
      "@cruncher/adapter-grafana-loki-browser",
    ],
  },
  server: {
    watch: {
      // Vite ignores node_modules by default; un-ignore pnpm-linked workspace
      // packages so that HMR fires when `turbo watch build` rebuilds their dist/.
      ignored: (file: string) =>
        file.includes("/node_modules/") &&
        !file.includes("/node_modules/@cruncher/"),
    },
  },
});
