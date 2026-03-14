"use client";

import { ChakraProvider, EnvironmentProvider } from "@chakra-ui/react";
import createCache from "@emotion/cache";
import { CacheProvider, Global, css } from "@emotion/react";
import { ThemeProvider, type ThemeProviderProps } from "next-themes";
import { createContext, useEffect, useState } from "react";
import root from "react-shadow/emotion";
import { system } from "./system";
import { useAppTheme, type ThemeId } from "./useAppTheme";
import { DEFAULT_THEME } from "@cruncher/server-shared";
import datepickerStyle from "react-day-picker/style.css?inline";

type ThemeContextValue = {
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
};

export const ThemeContext = createContext<ThemeContextValue>({
  themeId: DEFAULT_THEME,
  setThemeId: () => {},
});

export function Provider(props: ThemeProviderProps) {
  const [shadow, setShadow] = useState<HTMLElement | null>(null);
  const [cache, setCache] = useState<ReturnType<typeof createCache> | null>(
    null,
  );
  const { themeId, theme, setThemeId } = useAppTheme();

  useEffect(() => {
    if (!shadow?.shadowRoot || cache) return;

    const emotionCache = createCache({
      key: "root",
      container: shadow.shadowRoot,
    });
    setCache(emotionCache);
  }, [shadow, cache]);

  // Expose topbar colors to the document scope (topbar is outside shadow DOM)
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--app-topbar-gradient-start",
      theme.bgSubtle,
    );
    document.documentElement.style.setProperty(
      "--app-topbar-gradient-end",
      theme.titleBarGradient,
    );
    document.documentElement.style.setProperty(
      "--app-topbar-text",
      theme.fgSubtle,
    );
  }, [theme]);

  const themeStyles = css`
    :host {
      --chakra-colors-bg: ${theme.bg};
      --chakra-colors-bg-subtle: ${theme.bgSubtle};
      --chakra-colors-bg-muted: ${theme.bgMuted};
      --chakra-colors-bg-emphasized: ${theme.bgEmphasized};
      --chakra-colors-bg-panel: ${theme.bgPanel};
      --chakra-colors-fg: ${theme.fg};
      --chakra-colors-fg-muted: ${theme.fgMuted};
      --chakra-colors-fg-subtle: ${theme.fgSubtle};
      --chakra-colors-border: ${theme.border};
      --chakra-colors-border-muted: ${theme.borderMuted};
      --chakra-colors-border-emphasized: ${theme.borderEmphasized};
      --chakra-colors-accent: ${theme.accent};
      --chakra-colors-accent-muted: ${theme.accentMuted};
      --chakra-colors-accent-subtle: ${theme.accentSubtle};
      --chakra-colors-syntax-keyword: ${theme.syntaxKeyword};
      --chakra-colors-syntax-column: ${theme.syntaxColumn};
      --chakra-colors-syntax-string: ${theme.syntaxString};
      --chakra-colors-syntax-function: ${theme.syntaxFunction};
      --chakra-colors-syntax-boolean: ${theme.syntaxBoolean};
      --chakra-colors-syntax-number: ${theme.syntaxNumber};
      --chakra-colors-syntax-operator: ${theme.syntaxOperator};
      --chakra-colors-syntax-regex: ${theme.syntaxRegex};
      --chakra-colors-syntax-param: ${theme.syntaxParam};
      --chakra-colors-syntax-index: ${theme.syntaxIndex};
      --chakra-colors-syntax-pipe: ${theme.syntaxPipe};
      --chakra-colors-syntax-comment: ${theme.syntaxComment};
      --chakra-colors-syntax-default: ${theme.syntaxDefault};
      --chakra-colors-log-default: ${theme.logDefault};
      --chakra-colors-log-error: ${theme.logError};
      --chakra-colors-log-warn: ${theme.logWarn};
      --chakra-colors-highlight-mark: ${theme.highlightMark};
      --chakra-colors-highlight-mark-text: ${theme.highlightMarkText};
      /* missing border tokens not in system.tsx */
      --chakra-colors-border-subtle: ${theme.borderMuted};
      --chakra-colors-border-inverted: ${theme.borderEmphasized};
      /* inverted bg/fg — Chakra Toast in dark mode would render white by default */
      --chakra-colors-bg-inverted: ${theme.bgMuted};
      --chakra-colors-fg-inverted: ${theme.fg};
      /* indigo palette — maps to current theme accent */
      --chakra-colors-indigo-solid: ${theme.accent};
      --chakra-colors-indigo-muted: ${theme.accentMuted};
      --chakra-colors-indigo-subtle: ${theme.accentSubtle};
      --chakra-colors-indigo-emphasized: ${theme.borderEmphasized};
      --chakra-colors-indigo-fg: ${theme.accent};
      --chakra-colors-indigo-contrast: ${theme.bg};
      --chakra-colors-indigo-border: ${theme.borderEmphasized};
      --chakra-colors-indigo-focus-ring: ${theme.accent};
      /* gray palette — Chakra's default for Button/IconButton with no explicit colorPalette */
      --chakra-colors-gray-subtle: ${theme.bgEmphasized};
      --chakra-colors-gray-muted: ${theme.border};
      --chakra-colors-gray-emphasized: ${theme.borderEmphasized};
      --chakra-colors-gray-solid: ${theme.bgEmphasized};
      --chakra-colors-gray-contrast: ${theme.fg};
      --chakra-colors-gray-fg: ${theme.fgMuted};
      --chakra-colors-gray-border: ${theme.border};
      --chakra-colors-gray-focus-ring: ${theme.accent};
      /* green palette — success/loaded progress bars and status text */
      --chakra-colors-green-solid: ${theme.logDefault};
      --chakra-colors-green-muted: ${theme.logDefault};
      --chakra-colors-green-subtle: ${theme.bgEmphasized};
      --chakra-colors-green-emphasized: ${theme.logDefault};
      --chakra-colors-green-fg: ${theme.logDefault};
      --chakra-colors-green-contrast: ${theme.bg};
      --chakra-colors-green-border: ${theme.border};
      --chakra-colors-green-focus-ring: ${theme.logDefault};
      /* red palette — error progress bars, status text, and bg="red" dot */
      --chakra-colors-red-solid: ${theme.logError};
      --chakra-colors-red-muted: ${theme.logError};
      --chakra-colors-red-subtle: ${theme.bgEmphasized};
      --chakra-colors-red-emphasized: ${theme.logError};
      --chakra-colors-red-fg: ${theme.logError};
      --chakra-colors-red-contrast: ${theme.bg};
      --chakra-colors-red-border: ${theme.border};
      --chakra-colors-red-focus-ring: ${theme.logError};
      /* blue palette — toaster loading spinner (color="blue.solid") */
      --chakra-colors-blue-solid: ${theme.accent};
      --chakra-colors-blue-muted: ${theme.accentMuted};
      --chakra-colors-blue-subtle: ${theme.accentSubtle};
      --chakra-colors-blue-emphasized: ${theme.borderEmphasized};
      --chakra-colors-blue-fg: ${theme.accent};
      --chakra-colors-blue-contrast: ${theme.bg};
      --chakra-colors-blue-border: ${theme.border};
      --chakra-colors-blue-focus-ring: ${theme.accent};
      /* white palette — colorPalette="white" for loading/indeterminate progress bar */
      --chakra-colors-white-solid: ${theme.fgMuted};
      --chakra-colors-white-muted: ${theme.border};
      --chakra-colors-white-subtle: ${theme.bgEmphasized};
      --chakra-colors-white-fg: ${theme.fg};
      --chakra-colors-white-border: ${theme.border};
      --chakra-colors-white-focus-ring: ${theme.accent};
    }
    /* Progress bar track — use border color so the track is always visible against the bg */
    [data-scope="progress"][data-part="track"] {
      background: ${theme.border} !important;
    }
    /* react-day-picker accent theming */
    .rdp-root {
      --rdp-accent-color: ${theme.accent};
      --rdp-accent-background-color: ${theme.accentSubtle};
    }
    /* Chakra tooltip — use themed bg instead of inverted */
    [data-scope="tooltip"][data-part="content"] {
      background: ${theme.bgEmphasized} !important;
      color: ${theme.fg} !important;
      border: 1px solid ${theme.border} !important;
    }
    [data-scope="tooltip"][data-part="arrow-tip"] {
      background: ${theme.bgEmphasized} !important;
    }
    ::-webkit-scrollbar-track {
      background: ${theme.scrollbarTrack};
    }
    ::-webkit-scrollbar-thumb {
      background: ${theme.scrollbarThumb};
    }
    ::-webkit-scrollbar-thumb:hover {
      background: ${theme.scrollbarThumbHover};
    }
  `;

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId }}>
      <root.div
        id="cruncher-root"
        className="dark"
        data-theme={themeId}
        ref={setShadow}
        css={css`
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
        `}
      >
        {shadow && cache && (
          <EnvironmentProvider value={() => shadow.shadowRoot ?? document}>
            <style type="text/css">{datepickerStyle}</style>
            <CacheProvider value={cache}>
              <ChakraProvider value={system}>
                <Global styles={themeStyles} />
                <ThemeProvider {...props} />
              </ChakraProvider>
            </CacheProvider>
          </EnvironmentProvider>
        )}
      </root.div>
    </ThemeContext.Provider>
  );
}
