import {
  Badge,
  Box,
  Button,
  Heading,
  IconButton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { css } from "@emotion/react";
import { token } from "~components/ui/system";
import { createFileRoute } from "@tanstack/react-router";
import { useContext, useEffect, useState } from "react";
import { LuX } from "react-icons/lu";
import { KeybindingsContext } from "~core/KeybindingsContext";
import {
  getUserPlatform,
  globalShortcuts,
  headerShortcuts,
  PlatformTypes,
  searcherGlobalShortcuts,
  searcherShortcuts,
  ShortcutDefinitions,
  ShortcutHolder,
} from "~core/keymaps";
import { appStore, useApplicationStore } from "~core/store/appStore";

export const Route = createFileRoute("/settings/keybindings")({
  component: KeybindingsSettings,
});

const SHORTCUT_GROUPS = [
  {
    title: "Global",
    holder: globalShortcuts as ShortcutHolder<ShortcutDefinitions>,
  },
  {
    title: "Searcher Global",
    holder: searcherGlobalShortcuts as ShortcutHolder<ShortcutDefinitions>,
  },
  {
    title: "Searcher",
    holder: searcherShortcuts as ShortcutHolder<ShortcutDefinitions>,
  },
  {
    title: "Query",
    holder: headerShortcuts as ShortcutHolder<ShortcutDefinitions>,
  },
];

const mirrorModifiers = (
  combo: string,
  fromPlatform: PlatformTypes,
): { Mac: string; Windows: string } => {
  const mac =
    fromPlatform === "Mac" ? combo : combo.replace(/\bControl\b/g, "Meta");
  const win =
    fromPlatform === "Windows" ? combo : combo.replace(/\bMeta\b/g, "Control");
  return { Mac: mac, Windows: win };
};

const buildComboFromEvent = (e: KeyboardEvent): string | null => {
  const modifierCodes = [
    "MetaLeft",
    "MetaRight",
    "ControlLeft",
    "ControlRight",
    "ShiftLeft",
    "ShiftRight",
    "AltLeft",
    "AltRight",
  ];
  if (modifierCodes.includes(e.code)) return null;

  const parts: string[] = [];
  if (e.metaKey) parts.push("Meta");
  if (e.ctrlKey) parts.push("Control");
  if (e.shiftKey) parts.push("Shift");
  if (e.altKey) parts.push("Alt");

  if (e.code === "Slash") {
    parts.push("Slash");
  } else if (e.code === "Enter") {
    parts.push("Enter");
  } else if (e.code.startsWith("Key")) {
    parts.push(e.code.substring(3));
  } else {
    parts.push(e.code);
  }

  return parts.join(" + ");
};

function KeybindingsSettings() {
  const [saveTarget, setSaveTarget] = useState<"global" | "local">("local");
  const controller = useApplicationStore((state) => state.controller);

  const handleResetAll = async () => {
    await controller.resetAllKeybindings();
    await appStore.getState().reload();
  };

  return (
    <Stack maxW={800} gap={6} pb={8}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" alignItems="center" gap={2}>
          <Text fontSize="sm" color={token("colors.fg.muted")}>
            Save to:
          </Text>
          <Stack direction="row" gap={1}>
            <SaveTargetButton
              label="Local"
              active={saveTarget === "local"}
              onClick={() => setSaveTarget("local")}
            />
            <SaveTargetButton
              label="Global"
              active={saveTarget === "global"}
              onClick={() => setSaveTarget("global")}
            />
          </Stack>
        </Stack>
        <Button size="sm" variant="outline" onClick={handleResetAll}>
          Reset All
        </Button>
      </Stack>

      {SHORTCUT_GROUPS.map(({ title, holder }) => (
        <Box key={title}>
          <Heading size="sm" mb={2}>
            {title}
          </Heading>
          <Stack gap={1}>
            {Object.keys(holder.getShortcuts()).map((shortcut) => (
              <KeybindingRow
                key={shortcut}
                shortcut={shortcut}
                holder={holder}
                saveTarget={saveTarget}
              />
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

const SaveTargetButton: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, active, onClick }) => (
  <Box
    as="button"
    onClick={onClick}
    css={css`
      padding: 2px 10px;
      border-radius: 4px;
      font-size: 0.8rem;
      cursor: pointer;
      border: 1px solid ${token("colors.border")};
      background-color: ${active ? token("colors.accent") : token("colors.bg")};
      color: ${active ? token("colors.bg") : token("colors.fg.muted")};
      transition: background-color 0.15s;
    `}
  >
    {label}
  </Box>
);

type KeybindingRowProps = {
  shortcut: string;
  holder: ShortcutHolder<ShortcutDefinitions>;
  saveTarget: "global" | "local";
};

const KeybindingRow: React.FC<KeybindingRowProps> = ({
  shortcut,
  holder,
  saveTarget,
}) => {
  const [recording, setRecording] = useState(false);
  const { overrides, getSource } = useContext(KeybindingsContext);
  const controller = useApplicationStore((state) => state.controller);

  const platform = getUserPlatform();
  const source = getSource(shortcut);

  const currentCombo =
    overrides[shortcut]?.[platform] ??
    holder.getShortcuts()[shortcut]?.[platform] ??
    "";

  const displayAlias = currentCombo
    .split(" + ")
    .map((k) => {
      const aliases: Record<string, string> = {
        Meta: platform === "Mac" ? "⌘" : "Win",
        Control: platform === "Mac" ? "⌃" : "Ctrl",
        Shift: platform === "Mac" ? "⇧" : "Shift",
        Alt: platform === "Mac" ? "⌥" : "Alt",
        Slash: "/",
      };
      return aliases[k] ?? k;
    })
    .join(" ");

  useEffect(() => {
    if (!recording) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setRecording(false);
        return;
      }
      e.preventDefault();
      const combo = buildComboFromEvent(e);
      if (!combo) return;
      const { Mac, Windows } = mirrorModifiers(combo, platform);
      controller
        .setKeybinding(shortcut, Mac, Windows, saveTarget)
        .then(() => appStore.getState().reload());
      setRecording(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [recording, shortcut, saveTarget, platform, controller]);

  const handleReset = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await controller.resetKeybinding(shortcut);
    await appStore.getState().reload();
  };

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      py={1}
      px={2}
      css={css`
        border-radius: 4px;
        &:hover {
          background-color: ${token("colors.bg.subtle")};
        }
      `}
    >
      <Text fontSize="sm">{shortcut}</Text>
      <Stack direction="row" alignItems="center" gap={2}>
        {source !== "default" && (
          <Badge
            size="sm"
            colorPalette={source === "global" ? "blue" : "green"}
          >
            {source}
          </Badge>
        )}
        <Box
          as="button"
          onClick={() => setRecording(true)}
          css={css`
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-family: monospace;
            cursor: pointer;
            border: 1px solid ${token("colors.border")};
            background-color: ${
              recording ? token("colors.accent") : token("colors.bg.subtle")
            };
            color: ${recording ? token("colors.bg") : token("colors.fg.muted")};
            min-width: 60px;
            text-align: center;
            transition: background-color 0.15s;
            animation: ${recording ? "pulse 1s infinite" : "none"};
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}
        >
          {recording ? "Press keys…" : displayAlias}
        </Box>
        {source !== "default" && (
          <IconButton
            size="xs"
            variant="ghost"
            onClick={handleReset}
            aria-label={`Reset ${shortcut}`}
          >
            <LuX />
          </IconButton>
        )}
      </Stack>
    </Box>
  );
};
