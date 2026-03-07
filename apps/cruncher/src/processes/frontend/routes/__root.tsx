import { Box, ProgressCircle } from "@chakra-ui/react";
import logo from "src/icons/png/256x256.png";
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
  min-height: 0;
  position: relative;
  background-color: ${token("colors.bg")};
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
      <div
        css={css`
          height: 34px;
          flex-shrink: 0;
          background: linear-gradient(
            to bottom,
            var(--app-topbar-gradient-start, #13141f),
            var(--app-topbar-gradient-end, #0d0e14)
          );
          -webkit-app-region: drag;
          display: flex;
          align-items: center;
          justify-content: center;
        `}
      >
        <img
          src={logo}
          alt="Cruncher Logo"
          style={{ width: "20px", height: "20px", pointerEvents: "none", userSelect: "none" }}
        />
        <span
          css={css`
            font-size: 0.75rem;
            font-weight: 600;
            letter-spacing: 0.08em;
            color: var(--app-topbar-text, #4a5568);
            text-transform: uppercase;
            -webkit-app-region: drag;
            user-select: none;
            margin-left: 6px;
          `}
        >
          Cruncher
        </span>
      </div>
      <QueryClientProvider client={queryClient}>
        <Provider>
          <Toaster />
          <ApplicationProvider>
            <JotaiProvider>
              <MainContent />
            </JotaiProvider>
          </ApplicationProvider>
        </Provider>
      </QueryClientProvider>
      <TanStackDevtools
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
    <Wrapper>
      <Shortcuts open={isShown} onOpenChange={setIsShown} />
      <SideMenu />
      <Outlet />
    </Wrapper>
  );
};
