import { Box, ProgressCircle } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { Provider as JotaiProvider, useAtomValue } from "jotai";
import { useMemo, useState } from "react";
import { Provider } from "~components/ui/provider";
import { Toaster } from "~components/ui/toaster";
import { ApplicationProvider } from "./ApplicationProvider";
import { SearcherWrapper } from "./SearcherWrapper";
import { Shortcuts } from "./Shortcuts";
import { selectedMenuItemAtom, SideMenu } from "./SideMenu";
import { globalShortcuts, useShortcuts } from "./keymaps";
import { useApplicationStore } from "./store/store";

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  min-width: 0;
  height: 100%;
  position: relative;
  background-color: rgb(17, 18, 23);
`;

const MainContentInner = () => {
  const selectedItem = useAtomValue(selectedMenuItemAtom);
  const isInitialized = useApplicationStore((state) => state.isInitialized);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useShortcuts(globalShortcuts, (shortcut) => {
    switch (shortcut) {
      case "toggle-help":
        setIsHelpOpen((prev) => !prev);
        break;
    }
  });

  const component = useMemo(() => {
    switch (selectedItem) {
      case "searcher":
        return <SearcherWrapper />;

      default:
        return "not implemented";
    }
  }, [selectedItem]);

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
      {component}
    </Wrapper>
  );
};

const MainContent = () => {
  return (
    <ApplicationProvider>
      <Provider>
        <JotaiProvider>
          <MainContentInner />
        </JotaiProvider>
      </Provider>
    </ApplicationProvider>
  );
};

export default MainContent;
