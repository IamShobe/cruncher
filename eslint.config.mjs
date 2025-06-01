import { defineConfig } from "eslint/config";
import { fixupConfigRules } from "@eslint/compat";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import { importX } from "eslint-plugin-import-x";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  {
    extends: fixupConfigRules(
      compat.extends(
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:import/recommended",
        "plugin:import/electron",
        "plugin:import/typescript",
        "import-x/flat/recommended",
      )
    ),
    // only lint files in the src directory
    files: ["src/**/*.ts", "src/**/*.tsx", "src/**/*.js", "src/**/*.jsx"],
    plugins: {
        'import-x': importX,
    },

    rules: {
        'import-x/no-dynamic-require': 'warn',
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      parser: tsParser,
    },
  },
]);
