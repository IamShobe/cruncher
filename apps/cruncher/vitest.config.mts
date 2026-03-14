import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  test: {
    exclude: [
      "dist/**",
      "node_modules/**",
      "**/node_modules/**",
      "out/**",
      "build/**",
      "resources/**",
    ],
    watch: false,
    testTimeout: 30000,
  },
  plugins: [tsconfigPaths()],
});
