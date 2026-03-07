import { useState } from "react";
import { ThemeId, THEMES } from "./themes";

export { type ThemeId };

export const useAppTheme = () => {
  const [themeId, setThemeIdState] = useState<ThemeId>(
    () => (localStorage.getItem("cruncher-theme") as ThemeId) ?? "midnight",
  );

  const setThemeId = (id: ThemeId) => {
    localStorage.setItem("cruncher-theme", id);
    setThemeIdState(id);
  };

  return { themeId, theme: THEMES[themeId], setThemeId };
};
