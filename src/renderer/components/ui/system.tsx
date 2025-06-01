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
});

export const system = createSystem(defaultConfig, config);
