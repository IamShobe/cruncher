import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import process from "process";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// is production
const isProduction = process.env.NODE_ENV === "production";

// https://vitejs.dev/config
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      // autoCodeSplitting: true,
    }),
    tsconfigPaths(),
    react(),
  ],
  resolve: {
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx"],
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
