import {
  Button,
  CloseButton,
  Drawer,
  IconButton,
  Portal,
} from "@chakra-ui/react";
import { LuSettings } from "react-icons/lu";
import { Tooltip } from "~components/presets/Tooltip";

export const SettingsDrawer = () => {
  return (
    <Drawer.Root size={"md"}>
      <Tooltip text="Search Settings">
        <Drawer.Trigger asChild>
          <IconButton aria-label="Settings" size="2xs" variant="surface">
            <LuSettings />
          </IconButton>
        </Drawer.Trigger>
      </Tooltip>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner padding="4">
          <Drawer.Content rounded="md">
            <Drawer.Header>
              <Drawer.Title>Search Settings</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body></Drawer.Body>
            <Drawer.Footer>
              <Button variant="outline">Cancel</Button>
              <Button>Save</Button>
            </Drawer.Footer>
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};
