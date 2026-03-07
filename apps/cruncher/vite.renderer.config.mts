import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { devtools } from "@tanstack/devtools-vite";

// https://vitejs.dev/config
export default defineConfig({
  plugins: [
    devtools(),
    tanstackRouter({
      target: "react",
      // autoCodeSplitting: true,
    }),
    tsconfigPaths(),
    react(),
  ],
  resolve: {
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
