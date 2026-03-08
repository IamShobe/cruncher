import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const varRoot = ":host";

const config = defineConfig({
  cssVarsRoot: varRoot,
  conditions: {
    light: `, ${varRoot} &, .light &`,
    dark: `, ${varRoot} &, .dark &`,
  },
  preflight: { scope: varRoot },
  globalCss: {
    [varRoot]: defaultConfig.globalCss?.html ?? {},
  },
  theme: {
    tokens: {
      colors: {
        indigo: {
          50: { value: "#eef2ff" },
          100: { value: "#e0e7ff" },
          200: { value: "#c7d2fe" },
          300: { value: "#a5b4fc" },
          400: { value: "#818cf8" },
          500: { value: "#6366f1" },
          600: { value: "#4f46e5" },
          700: { value: "#4338ca" },
          800: { value: "#3730a3" },
          900: { value: "#312e81" },
        },
      },
      radii: {
        md: { value: "6px" },
        lg: { value: "10px" },
        xl: { value: "14px" },
        "2xl": { value: "20px" },
      },
    },
    semanticTokens: {
      colors: {
        // Override Chakra built-in bg/fg/border semantic tokens so all Chakra
        // components (Button, Input, Dialog, Menu, Select, etc.) automatically
        // render with our dark theme without per-component overrides.
        bg: {
          DEFAULT: { value: "#0d0e14" },
          subtle: { value: "#13141f" },
          muted: { value: "#1a1b27" },
          emphasized: { value: "#21223a" },
          panel: { value: "#1a1b27" },
        },
        fg: {
          DEFAULT: { value: "#e2e8f0" },
          muted: { value: "#8892a4" },
          subtle: { value: "#4a5568" },
        },
        border: {
          DEFAULT: { value: "#252638" },
          subtle: { value: "#1e1f2e" },
          muted: { value: "#1e1f2e" },
          emphasized: { value: "#6366f1" },
          inverted: { value: "#6366f1" },
        },
        // Custom accent token family (indigo)
        accent: {
          DEFAULT: { value: "#6366f1" },
          muted: { value: "#818cf8" },
          subtle: { value: "rgba(99,102,241,0.15)" },
        },
        // indigo colorPalette tokens (used by colorPalette="indigo")
        indigo: {
          solid: { value: "#6366f1" },
          subtle: { value: "rgba(99,102,241,0.15)" },
          muted: { value: "#818cf8" },
          contrast: { value: "#ffffff" },
          fg: { value: "#6366f1" },
          emphasized: { value: "#4f46e5" },
          focusRing: { value: "#6366f1" },
        },
        // Syntax highlighting — Midnight defaults
        syntax: {
          keyword: { value: "#a78bfa" },
          column: { value: "#34d399" },
          string: { value: "#f87171" },
          function: { value: "#c084fc" },
          boolean: { value: "#fbbf24" },
          number: { value: "#fb923c" },
          operator: { value: "#f472b6" },
          regex: { value: "#22d3ee" },
          param: { value: "#38bdf8" },
          index: { value: "#2dd4bf" },
          pipe: { value: "#fde68a" },
          comment: { value: "#6b7280" },
          default: { value: "#8892a4" },
        },
        // Log level gutter strip — Midnight defaults
        log: {
          default: { value: "#2caf00" },
          error: { value: "#b91f1f" },
          warn: { value: "#ae9e21" },
        },
        // Search match highlight — Midnight defaults
        highlight: {
          mark: { value: "#ffe066" },
          markText: { value: "#1a1b27" },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);

/**
 * Resolves a Chakra token path to its CSS variable reference string.
 * Semantic tokens (e.g. "colors.fg.subtle") return "var(--chakra-colors-fg-subtle)".
 * Scale tokens (e.g. "colors.red.200") return the raw hex value.
 */
export const token = (path: string) => system.token(path);
