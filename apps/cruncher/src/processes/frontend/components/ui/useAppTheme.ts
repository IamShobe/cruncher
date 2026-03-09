import { useEffect, useState } from "react";
import { ThemeId, THEMES } from "./themes";
import { DEFAULT_THEME } from "~lib/themeDefaults";
import { appStore, useApplicationStore } from "~core/store/appStore";

export { type ThemeId };

export const useAppTheme = () => {
  const generalSettings = useApplicationStore((state) => state.generalSettings);
  const [themeId, setThemeIdState] = useState<ThemeId>(DEFAULT_THEME);

  // Sync with the config-file value once generalSettings is loaded
  useEffect(() => {
    const incoming = generalSettings?.theme as ThemeId | undefined;
    if (incoming && incoming in THEMES) {
      setThemeIdState(incoming);
    }
  }, [generalSettings?.theme]);

  const setThemeId = (id: ThemeId) => {
    setThemeIdState(id); // optimistic update
    const controller = appStore.getState().controller;
    if (controller) {
      controller.setTheme(id).catch(console.error);
    }
  };

  return { themeId, theme: THEMES[themeId], setThemeId };
};
