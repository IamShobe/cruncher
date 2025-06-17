import {
  Box,
  CloseButton,
  Dialog,
  Heading,
  Portal,
  Stack,
} from "@chakra-ui/react";
import { FC } from "react";
import { searcherShortcuts } from "./keymaps";
import { Shortcut } from "~components/ui/shortcut";

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
              <Stack>
                <Box maxW="20rem">
                  <Heading size="md">Searcher Shortcuts</Heading>
                  {Object.keys(searcherShortcuts.getShortcuts()).map(
                    (value) => {
                      return (
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          key={value}
                        >
                          <span>{value}</span>
                          <Shortcut
                            keys={searcherShortcuts.getAlias(
                              value as keyof ReturnType<
                                typeof searcherShortcuts.getShortcuts
                              >,
                            )}
                          />
                        </Box>
                      );
                    },
                  )}
                </Box>
              </Stack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
