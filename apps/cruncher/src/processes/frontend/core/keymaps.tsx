import { useContext, useMemo } from "react";
import { useEvent } from "react-use";
import { KeybindingsContext } from "./KeybindingsContext";

type KeyTypes = "Meta" | "Shift" | "Alt" | "Control" | "Slash" | "Space";

export type PlatformTypes = "Mac" | "Windows";

type ShortcutAliases = Record<PlatformTypes, Record<KeyTypes, string>>;

export type ShortcutDefinitions = Record<string, Record<PlatformTypes, string>>;

const keyMapsAliases: ShortcutAliases = {
  Mac: {
    Meta: "⌘",
    Shift: "⇧",
    Alt: "⌥",
    Control: "⌃",
    Slash: "/",
    Space: "Space",
  },
  Windows: {
    Meta: "Win",
    Shift: "Shift",
    Alt: "Alt",
    Control: "Ctrl",
    Slash: "/",
    Space: "Space",
  },
};

export class ShortcutHolder<T extends ShortcutDefinitions> {
  constructor(private shortcuts: T) {}

  getShortcuts() {
    return this.shortcuts;
  }

  private getShortcutKeys(shortcut: keyof T) {
    const platform = getUserPlatform();
    return this.shortcuts[shortcut][platform].split(" + ");
  }
  isPressed(event: React.KeyboardEvent | KeyboardEvent, shortcut: keyof T) {
    const keys = this.getShortcutKeys(shortcut);
    if (!keys) {
      return false;
    }

    return keys.every((key) => {
      switch (key) {
        case "Meta":
          return event.metaKey;
        case "Shift":
          return event.shiftKey;
        case "Alt":
          return event.altKey;
        case "Control":
          return event.ctrlKey;
        case "Enter":
          return event.code === "Enter";
        case "Slash":
          return event.code === "Slash";
        case "Space":
          return event.code === "Space";

        default:
          return event.code === `Key${key}`;
      }
    });
  }
  getAlias(shortcut: keyof T) {
    const platform = getUserPlatform();
    const keys = this.shortcuts[shortcut][platform].split(" + ");
    return keys.map((key) => {
      const platformKeys = keyMapsAliases[platform];
      return platformKeys?.[key as KeyTypes] ?? key;
    });
  }

  withOverrides(
    overrides: Record<string, { Mac: string; Windows: string }>,
  ): ShortcutHolder<T> {
    const merged = { ...this.shortcuts } as T;
    for (const [key, value] of Object.entries(overrides)) {
      if (key in merged) {
        (merged as Record<string, Record<PlatformTypes, string>>)[key] = value;
      }
    }
    return new ShortcutHolder<T>(merged);
  }
}

export const getUserPlatform = (): PlatformTypes => {
  return navigator.userAgent.includes("Macintosh") ? "Mac" : "Windows";
};

export const headerShortcuts = new ShortcutHolder({
  search: {
    Mac: "Meta + Shift + Enter",
    Windows: "Control + Shift + Enter",
  },
  "re-evaluate": {
    Mac: "Shift + Enter",
    Windows: "Shift + Enter",
  },
  "trigger-autocomplete": {
    Mac: "Control + Space",
    Windows: "Control + Space",
  },
});

export const searcherShortcuts = new ShortcutHolder({
  "select-time": {
    Mac: "Alt + T",
    Windows: "Alt + T",
  },
  query: {
    Mac: "Alt + Q",
    Windows: "Alt + Q",
  },
  "copy-link": {
    Mac: "Meta + Shift + C",
    Windows: "Control + Shift + C",
  },
  "toggle-until-now": {
    Mac: "Meta + N",
    Windows: "Ctrl + N",
  },
  "toggle-header": {
    Mac: "Meta + H",
    Windows: "Control + H",
  },
  highlight: {
    Mac: "Meta + F",
    Windows: "Control + F",
  },
  "toggle-live-mode": {
    Mac: "Meta + L",
    Windows: "Control + L",
  },
  "toggle-idle-hints": {
    Mac: "Meta + Shift + I",
    Windows: "Control + Shift + I",
  },
});

export const searcherGlobalShortcuts = new ShortcutHolder({
  "create-new-tab": {
    Mac: "Meta + T",
    Windows: "Control + T",
  },
  "close-tab": {
    Mac: "Meta + W",
    Windows: "Control + W",
  },
});

export const globalShortcuts = new ShortcutHolder({
  "toggle-help": {
    Mac: "Meta + Slash",
    Windows: "Control + Slash",
  },
});


export type ShortcutHandler<T extends ShortcutDefinitions> = (
  shortcut: keyof T,
) => void;

export const matchShortcut = <T extends ShortcutDefinitions>(
  event: React.KeyboardEvent | KeyboardEvent,
  shortcuts: ShortcutHolder<T>,
) => {
  const availableShortcuts = shortcuts.getShortcuts();
  for (const shortcut of Object.keys(availableShortcuts)) {
    if (
      shortcuts.isPressed(event, shortcut as keyof typeof availableShortcuts)
    ) {
      return shortcut as keyof typeof availableShortcuts;
    }
  }

  return null;
};

export const useResolvedShortcuts = <T extends ShortcutDefinitions>(
  shortcuts: ShortcutHolder<T>,
): ShortcutHolder<T> => {
  const { overrides } = useContext(KeybindingsContext);
  return useMemo(
    () => shortcuts.withOverrides(overrides),
    [shortcuts, overrides],
  );
};

export const useShortcuts = <T extends ShortcutDefinitions>(
  shortcuts: ShortcutHolder<T>,
  handler: ShortcutHandler<T>,
) => {
  const resolved = useResolvedShortcuts(shortcuts);
  const onKeyDown = useMemo(
    () => createShortcutsHandler(resolved, handler),
    [resolved, handler],
  );
  useEvent("keydown", onKeyDown);
};

export const createShortcutsHandler = <T extends ShortcutDefinitions>(
  shortcuts: ShortcutHolder<T>,
  handler: ShortcutHandler<T>,
) => {
  return (e: React.KeyboardEvent | KeyboardEvent) => {
    const matchedShortcut = matchShortcut(e, shortcuts);
    if (matchedShortcut) {
      e.preventDefault();
      console.log("Matched shortcut:", matchedShortcut);
      handler(matchedShortcut);
    }
  };
};
