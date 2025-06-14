import { Box, ProgressCircle } from "@chakra-ui/react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Provider as JotaiProvider } from "jotai";
import { useState } from "react";
import { Provider } from "~components/ui/provider";
import { Toaster } from "~components/ui/toaster";
import { ApplicationProvider } from "~core/ApplicationProvider";
import { globalShortcuts, useShortcuts } from "~core/keymaps";
import { Shortcuts } from "~core/Shortcuts";
import { SideMenu } from "~core/SideMenu";
import { useApplicationStore } from "~core/store/appStore";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "~core/client";

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
        <ApplicationProvider>
          <Provider>
            <JotaiProvider>
              <MainContent />
            </JotaiProvider>
          </Provider>
        </ApplicationProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
      <TanStackRouterDevtools position="bottom-right" />
    </div>
  ),
});

const MainContent = () => {
  const isInitialized = useApplicationStore((state) => state.isInitialized);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useShortcuts(globalShortcuts, (shortcut) => {
    switch (shortcut) {
      case "toggle-help":
        setIsHelpOpen((prev) => !prev);
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
      <Shortcuts open={isHelpOpen} onOpenChange={setIsHelpOpen} />
      <Toaster />
      <SideMenu />
      <Outlet />
    </Wrapper>
  );
};
