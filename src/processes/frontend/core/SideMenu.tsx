import { Badge, Icon, IconButton, Separator, Stack } from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";
import { ReactNode } from "react";
import { LuBolt, LuFileSearch } from "react-icons/lu";
import logo from "src/icons/png/256x256.png";
import { Tooltip } from "~components/ui/tooltip";
import { ApplicationStore, useApplicationStore } from "./store/appStore";

export type MenuItem = "searcher" | "settings";

const versionSelector = (state: ApplicationStore) => {
  const version = state.version;
  if (!version) return "unknown";

  const { tag, isDev } = version;

  return tag + (isDev ? "*" : "");
}

export const SideMenu = () => {
  const version = useApplicationStore(versionSelector);

  return (
    <Stack direction="row" backgroundColor="rgb(22, 23, 29)" gap={0}>
      <Stack p={2} justify="space-between">
        <Stack>
          <Icon>
            <img
              src={logo}
              alt="Cruncher Logo"
              style={{ width: "40px", height: "40px" }}
            />
          </Icon>
          <Separator />
          <Stack gap={2}>
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
          <Separator />
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
          <Badge size="xs" variant="surface" justifyContent="center">
            {version}
          </Badge>
        </Stack>
      </Stack>
      <Separator orientation="vertical" m={0} p={0} />
    </Stack>
  );
};

const MenuButton: React.FC<{
  isActive?: boolean;
  tooltip: string;
  icon: ReactNode;
}> = ({ isActive: isSelected, tooltip, icon }) => {
  return (
    <Tooltip
      content={tooltip}
      showArrow
      positioning={{
        placement: "right",
      }}
    >
      <IconButton variant={isSelected ? "solid" : "outline"}>{icon}</IconButton>
    </Tooltip>
  );
};
