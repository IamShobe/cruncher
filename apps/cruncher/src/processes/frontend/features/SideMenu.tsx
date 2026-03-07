import { Badge, Box, IconButton, Separator, Stack } from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";
import { ReactNode } from "react";
import { LuBolt, LuFileSearch, LuKeyboard } from "react-icons/lu";
import {
  ApplicationStore,
  useApplicationStore,
  useSetShortcutsShown,
} from "~core/store/appStore";
import { Tooltip } from "../components/presets/Tooltip";
import { globalShortcuts } from "~core/keymaps";

export type MenuItem = "searcher" | "settings";

const versionSelector = (state: ApplicationStore) => {
  const version = state.version;
  if (!version) return "unknown";

  const { tag, isDev } = version;

  return tag + (isDev ? "*" : "");
};

export const SideMenu = () => {
  const version = useApplicationStore(versionSelector);
  const setShortcutsShown = useSetShortcutsShown();

  return (
    <Stack
      direction="row"
      gap={0}
      bg="bg.subtle"
    >
      <Stack p={2} justify="space-between" align="center">
        <Stack>
          <Stack gap={2} align="center">
            <Link to="/">
              {({ isActive }) => (
                <MenuButton
                  isActive={isActive}
                  tooltip="Searcher"
                  icon={<LuFileSearch />}
                />
              )}
            </Link>
          </Stack>
        </Stack>

        <Stack>
          <Separator borderColor="border" />
          <Tooltip
            text="Keyboard Shortcuts"
            position="right"
            shortcut={globalShortcuts.getAlias("toggle-help")}
          >
            <IconButton
              variant={"ghost"}
              size="sm"
              onClick={() => setShortcutsShown((prev) => !prev)}
              color="fg.subtle"
              _hover={{ bg: "bg.muted", color: "fg.muted" }}
            >
              <LuKeyboard />
            </IconButton>
          </Tooltip>
          <Stack gap={2}>
            <Link to={"/settings"}>
              {({ isActive }) => (
                <MenuButton
                  isActive={isActive}
                  tooltip="Settings"
                  icon={<LuBolt />}
                />
              )}
            </Link>
          </Stack>
          <Badge
            size="xs"
            variant="surface"
            justifyContent="center"
            bg="border"
            color="fg.muted"
            fontSize="0.6rem"
          >
            {version}
          </Badge>
        </Stack>
      </Stack>
      <Separator orientation="vertical" m={0} p={0} borderColor="border" />
    </Stack>
  );
};

const MenuButton: React.FC<{
  isActive?: boolean;
  tooltip: string;
  icon: ReactNode;
}> = ({ isActive: isSelected, tooltip, icon }) => {
  return (
    <Tooltip text={tooltip} position="right">
      <IconButton
        variant="ghost"
        size="sm"
        bg={isSelected ? "border" : "transparent"}
        color={isSelected ? "accent.muted" : "fg.subtle"}
        _hover={{ bg: "bg.muted", color: "fg.muted" }}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {icon}
      </IconButton>
    </Tooltip>
  );
};
