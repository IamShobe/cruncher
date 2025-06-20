import {
  Box,
  CloseButton,
  Dialog,
  Heading,
  Portal,
  Stack,
} from "@chakra-ui/react";
import { FC } from "react";
import {
  globalShortcuts,
  headerShortcuts,
  searcherGlobalShortcuts,
  searcherShortcuts,
  ShortcutDefinitions,
  ShortcutHolder,
} from "~core/keymaps.tsx";
import { Shortcut } from "~components/ui/shortcut.tsx";

export type ShortcutsProps = {
  open?: boolean;
  onOpenChange?: (state: boolean) => void;
};

export const Shortcuts: FC<ShortcutsProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog.Root
      size="lg"
      placement="center"
      motionPreset="slide-in-bottom"
      open={open}
      onOpenChange={({ open }) => onOpenChange?.(open)}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Shortcuts</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
              <Stack direction="row" gap={4}>
                <Stack gap={4} flex={1}>
                  <ShortcutsDisplay
                    shortcuts={globalShortcuts}
                    title="Global Shortcuts"
                  />
                  <ShortcutsDisplay
                    shortcuts={searcherGlobalShortcuts}
                    title="Searcher Global Shortcuts"
                  />
                  <ShortcutsDisplay
                    shortcuts={searcherShortcuts}
                    title="Searcher Shortcuts"
                  />
                </Stack>
                <Stack gap={2} flex={1}>
                  <ShortcutsDisplay
                    shortcuts={headerShortcuts}
                    title="Query Shortcuts"
                  />
                </Stack>
              </Stack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

function ShortcutsDisplay<T extends ShortcutDefinitions>({
  shortcuts,
  title,
}: {
  shortcuts: ShortcutHolder<T>;
  title: string;
}) {
  return (
    <Box maxW="20rem">
      <Heading size="md">{title}</Heading>
      {Object.keys(shortcuts.getShortcuts()).map((value) => {
        return (
          <Box display="flex" justifyContent="space-between" key={value}>
            <span>{value}</span>
            <Shortcut
              keys={shortcuts.getAlias(
                value as keyof ReturnType<typeof shortcuts.getShortcuts>,
              )}
            />
          </Box>
        );
      })}
    </Box>
  );
}
