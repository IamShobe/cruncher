import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config
export default defineConfig({
  plugins: [tsconfigPaths({ projects: [resolve(__dirname, "tsconfig.node.json")] })],
});
