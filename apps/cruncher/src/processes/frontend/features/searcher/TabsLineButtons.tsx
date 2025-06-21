import { Highlighter, HighlighterRef } from "~features/searcher/Highlighter";
import { MiniIconButton } from "~components/presets/IconButton";
import { searcherShortcuts, useShortcuts } from "~core/keymaps";
import { LuPanelTopClose, LuPanelTopOpen } from "react-icons/lu";
import { Stack } from "@chakra-ui/react";
import { useAtom } from "jotai/index";
import { isHeaderOpenAtom } from "~core/search";
import { useRef } from "react";

export const TabsLineButtons = () => {
  const [isHeaderOpen, setIsHeaderOpen] = useAtom(isHeaderOpenAtom);
  const highlightBoxRef = useRef<HighlighterRef>(null);
  const toggleHeader = () => {
    setIsHeaderOpen((prev) => !prev);
  };

  useShortcuts(searcherShortcuts, (shortcut) => {
    switch (shortcut) {
      case "highlight":
        highlightBoxRef.current?.focus();
        break;
      case "toggle-header":
        toggleHeader();
        break;
    }
  });
  return (
    <Stack direction="row" ml="auto" mr={4} alignItems="center">
      <Highlighter ref={highlightBoxRef} />
      <MiniIconButton
        tooltip="Toggle Header"
        tooltipShortcut={searcherShortcuts.getAlias("toggle-header")}
        onClick={toggleHeader}
      >
        {isHeaderOpen ? <LuPanelTopClose /> : <LuPanelTopOpen />}
      </MiniIconButton>
    </Stack>
  );
};
