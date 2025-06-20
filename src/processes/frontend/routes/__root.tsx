import { Box, ProgressCircle } from "@chakra-ui/react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Provider as JotaiProvider } from "jotai";
import { Provider } from "~components/ui/provider";
import { Toaster } from "~components/ui/toaster";
import { ApplicationProvider } from "~core/ApplicationProvider";
import { queryClient } from "~core/client";
import { globalShortcuts, useShortcuts } from "~core/keymaps";
import { Shortcuts } from "~features/shortcuts/Shortcuts.tsx";
import { SideMenu } from "~features/SideMenu";
import {
  useApplicationStore,
  useIsShortcutsShown,
  useSetShortcutsShown,
} from "~core/store/appStore";

import "../index.css";

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  min-width: 0;
  height: 100%;
  position: relative;
  background-color: rgb(17, 18, 23);
`;
export const Route = createRootRoute({
  component: () => (
    <div
      css={css`
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
      `}
    >
      <QueryClientProvider client={queryClient}>
        <Provider>
          <Toaster />
          <ApplicationProvider>
            <JotaiProvider>
              <MainContent />
            </JotaiProvider>
          </ApplicationProvider>
        </Provider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
      <TanStackRouterDevtools position="bottom-right" />
    </div>
  ),
});

const MainContent = () => {
  const isInitialized = useApplicationStore((state) => state.isInitialized);

  const isShown = useIsShortcutsShown();
  const setIsShown = useSetShortcutsShown();

  useShortcuts(globalShortcuts, (shortcut) => {
    switch (shortcut) {
      case "toggle-help":
        setIsShown(!isShown);
        break;
    }
  });

  if (!isInitialized) {
    return (
      <Box
        justifyContent={"center"}
        alignItems="center"
        flex={1}
        display="flex"
      >
        <ProgressCircle.Root value={null} size="lg">
          <ProgressCircle.Circle>
            <ProgressCircle.Track />
            <ProgressCircle.Range />
          </ProgressCircle.Circle>
        </ProgressCircle.Root>
      </Box>
    );
  }

  return (
    <Wrapper>
      <Shortcuts open={isShown} onOpenChange={setIsShown} />
      <SideMenu />
      <Outlet />
    </Wrapper>
  );
};
