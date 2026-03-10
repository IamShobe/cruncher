import { createContext, FC, ReactNode, useMemo } from "react";
import { useApplicationStore } from "./store/appStore";

type KeybindingOverride = { Mac: string; Windows: string };

export type KeybindingsContextValue = {
  overrides: Record<string, KeybindingOverride>;
  globalOverrides: Record<string, KeybindingOverride>;
  localOverrides: Record<string, KeybindingOverride>;
  getSource: (shortcut: string) => "default" | "global" | "local";
};

const defaultValue: KeybindingsContextValue = {
  overrides: {},
  globalOverrides: {},
  localOverrides: {},
  getSource: () => "default",
};

export const KeybindingsContext =
  createContext<KeybindingsContextValue>(defaultValue);

export const KeybindingsProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const generalSettings = useApplicationStore((state) => state.generalSettings);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings = generalSettings as any;

  const overrides = useMemo(
    () => (settings?.keybindings ?? {}) as Record<string, KeybindingOverride>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings?.keybindings],
  );

  const globalOverrides = useMemo(
    () =>
      (settings?.globalKeybindings ?? {}) as Record<string, KeybindingOverride>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings?.globalKeybindings],
  );

  const localOverrides = useMemo(
    () =>
      (settings?.localKeybindings ?? {}) as Record<string, KeybindingOverride>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings?.localKeybindings],
  );

  const value = useMemo(
    () => ({
      overrides,
      globalOverrides,
      localOverrides,
      getSource: (shortcut: string): "default" | "global" | "local" => {
        if (shortcut in localOverrides) return "local";
        if (shortcut in globalOverrides) return "global";
        return "default";
      },
    }),
    [overrides, globalOverrides, localOverrides],
  );

  return (
    <KeybindingsContext.Provider value={value}>
      {children}
    </KeybindingsContext.Provider>
  );
};
