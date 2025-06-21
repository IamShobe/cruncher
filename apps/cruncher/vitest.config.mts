import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  test: {
    exclude: ["dist/**", "node_modules/**"],
    watch: false,
  },
  plugins: [tsconfigPaths()],
});
