import { Box, ProgressCircle } from "@chakra-ui/react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { token } from "~components/ui/system";
import { QueryClientProvider } from "@tanstack/react-query";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Provider as JotaiProvider } from "jotai";
import { Provider } from "~components/ui/provider";
import { Toaster } from "~components/ui/toaster";
import { ApplicationProvider } from "~core/ApplicationProvider";
import { queryClient } from "~core/client";
import { globalShortcuts, useShortcuts } from "~core/keymaps";
import { Shortcuts } from "~features/shortcuts/Shortcuts";
import { SideMenu } from "~features/SideMenu";
import { TopBar } from "~features/TopBar";
import {
  useApplicationStore,
  useIsShortcutsShown,
  useSetShortcutsShown,
} from "~core/store/appStore";
import { ErrorBoundary } from "~components/ErrorBoundary";

import "../index.css";

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  min-width: 0;
  min-height: 0;
  position: relative;
  background-color: ${token("colors.bg")};
`;

const ScrollableBody = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: auto;
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
              <TopBar />
              <MainContent />
            </JotaiProvider>
          </ApplicationProvider>
        </Provider>
      </QueryClientProvider>
      <TanStackDevtools
        config={{
          hideUntilHover: true,
        }}
        plugins={[
          {
            name: "TanStack Query",
            render: <ReactQueryDevtoolsPanel />,
          },
          {
            name: "TanStack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
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
    <ScrollableBody>
      <ErrorBoundary>
        <Wrapper>
          <Shortcuts open={isShown} onOpenChange={setIsShown} />
          <SideMenu />
          <Outlet />
        </Wrapper>
      </ErrorBoundary>
    </ScrollableBody>
  );
};
