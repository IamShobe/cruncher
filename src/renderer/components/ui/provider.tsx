"use client";

import { ChakraProvider, EnvironmentProvider } from "@chakra-ui/react";
import createCache from "@emotion/cache";
import { CacheProvider, css } from "@emotion/react";
import { ThemeProvider, type ThemeProviderProps } from "next-themes";
import { useEffect, useState } from "react";
import root from "react-shadow/emotion";
import { system } from "./system";
import datepickerStyle from "react-day-picker/style.css?inline";

export function Provider(props: ThemeProviderProps) {
  const [shadow, setShadow] = useState<HTMLElement | null>(null);
  const [cache, setCache] = useState<ReturnType<typeof createCache> | null>(
    null
  );

  useEffect(() => {
    if (!shadow?.shadowRoot || cache) return;

    const emotionCache = createCache({
      key: "root",
      container: shadow.shadowRoot,
    });
    setCache(emotionCache);
  }, [shadow, cache]);

  return (
    <root.div
      id="cruncher-root"
      className="dark"
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
              <ThemeProvider {...props} />
            </ChakraProvider>
          </CacheProvider>
        </EnvironmentProvider>
      )}
    </root.div>
  );
}
