import fs from "node:fs";
import { CruncherConfig, CruncherConfigSchema, DEFAULT_MAX_HISTORY_ENTRIES, DEFAULT_THEME, UIConfig } from "@cruncher/server-shared";
import { Engine } from "../engineV2/engine";
import { InstanceRef, SearchProfileRef } from "../engineV2/types";
import YAML from "yaml";
import { PluginRef } from "@cruncher/adapter-utils";
import z from "zod/v4";
import { getConfigDirPath } from "../lib/config";
import { resolve, dirname } from "node:path";

const configFilePath = "cruncher.config.yaml";
const localConfigFileName = "cruncher.config.local.yaml";

// file should be in ~/.config/cruncher/cruncher.config.yaml
const defaultConfigFilePath = resolve(getConfigDirPath(), configFilePath);
const localConfigFilePath = resolve(getConfigDirPath(), localConfigFileName);

export type AppGeneralSettings = {
  configFilePath: string;
  theme: string;
};

export const appGeneralSettings: AppGeneralSettings = {
  configFilePath: defaultConfigFilePath,
  theme: DEFAULT_THEME,
};

export type ReadConfigResult =
  | { ok: true; config: CruncherConfig; error: null }
  | { ok: false; config: CruncherConfig; error: string };

const DEFAULT_CONFIG: CruncherConfig = { connectors: [] };

export const readConfig = (
  appGeneralSettings: AppGeneralSettings,
): ReadConfigResult => {
  if (!fs.existsSync(appGeneralSettings.configFilePath)) {
    console.warn(
      `Configuration file not found at ${appGeneralSettings.configFilePath}`,
    );
    return { ok: true, config: DEFAULT_CONFIG, error: null };
  }

  let raw: unknown;
  try {
    const fileContent = fs.readFileSync(
      appGeneralSettings.configFilePath,
      "utf8",
    );
    raw = YAML.parse(fileContent);
  } catch (e) {
    const msg = `Failed to read config file: ${e instanceof Error ? e.message : String(e)}`;
    console.error(msg);
    return { ok: false, config: DEFAULT_CONFIG, error: msg };
  }

  const validated = CruncherConfigSchema.safeParse(raw);
  if (!validated.success) {
    const msg = `Configuration file validation failed\n${z.prettifyError(validated.error)}`;
    console.error(msg);
    return { ok: false, config: DEFAULT_CONFIG, error: msg };
  }

  return { ok: true, config: validated.data, error: null };
};

export const writeConfig = (
  appGeneralSettings: AppGeneralSettings,
  updater: (config: CruncherConfig) => CruncherConfig,
): void => {
  const { config: current } = readConfig(appGeneralSettings);
  const updated = updater(current);
  fs.mkdirSync(dirname(appGeneralSettings.configFilePath), { recursive: true });
  fs.writeFileSync(
    appGeneralSettings.configFilePath,
    YAML.stringify(updated),
    "utf8",
  );
};

const readConfigFromPath = (filePath: string): ReadConfigResult => {
  if (!fs.existsSync(filePath)) {
    return { ok: true, config: DEFAULT_CONFIG, error: null };
  }

  let raw: unknown;
  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    raw = YAML.parse(fileContent);
  } catch (e) {
    const msg = `Failed to read config file: ${e instanceof Error ? e.message : String(e)}`;
    console.error(msg);
    return { ok: false, config: DEFAULT_CONFIG, error: msg };
  }

  const validated = CruncherConfigSchema.safeParse(raw);
  if (!validated.success) {
    const msg = `Configuration file validation failed\n${z.prettifyError(validated.error)}`;
    console.error(msg);
    return { ok: false, config: DEFAULT_CONFIG, error: msg };
  }

  return { ok: true, config: validated.data, error: null };
};

const writeConfigToPath = (
  filePath: string,
  updater: (config: CruncherConfig) => CruncherConfig,
): void => {
  const { config: current } = readConfigFromPath(filePath);
  const updated = updater(current);
  fs.mkdirSync(dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, YAML.stringify(updated), "utf8");
};

export type ResolvedConfig = Omit<CruncherConfig, "ui"> & { ui: UIConfig };

export type MergedConfigResult = {
  merged: ResolvedConfig;
  globalConfig: CruncherConfig;
  localConfig: CruncherConfig;
  error: string | null;
};

export const readMergedConfig = (
  appGeneralSettings: AppGeneralSettings,
): MergedConfigResult => {
  const { config: globalConfig, error } = readConfig(appGeneralSettings);
  const { config: localConfig } = readConfigFromPath(localConfigFilePath);

  const mergedKeybindings = {
    ...globalConfig.ui?.keybindings,
    ...localConfig.ui?.keybindings,
  };

  const merged: ResolvedConfig = {
    ...globalConfig,
    ui: {
      theme: localConfig.ui?.theme ?? globalConfig.ui?.theme ?? DEFAULT_THEME,
      liveInterval:
        localConfig.ui?.liveInterval ?? globalConfig.ui?.liveInterval ?? "5s",
      maxLogs: localConfig.ui?.maxLogs ?? globalConfig.ui?.maxLogs ?? 100000,
      liveAutoStopMinutes:
        localConfig.ui?.liveAutoStopMinutes ??
        globalConfig.ui?.liveAutoStopMinutes ??
        30,
      timezone:
        localConfig.ui?.timezone ?? globalConfig.ui?.timezone ?? "local",
      maxHistoryEntries:
        localConfig.ui?.maxHistoryEntries ?? globalConfig.ui?.maxHistoryEntries ?? DEFAULT_MAX_HISTORY_ENTRIES,
      keybindings: mergedKeybindings,
    },
  };

  return { merged, globalConfig, localConfig, error };
};

export const writeLocalConfig = (
  updater: (config: CruncherConfig) => CruncherConfig,
): void => {
  writeConfigToPath(localConfigFilePath, updater);
};

export const setupPluginsFromConfig = (
  appGeneralSettings: AppGeneralSettings,
  engineV2: Engine,
) => {
  const { config, error } = readConfig(appGeneralSettings);
  if (error) {
    console.error("Config errors (running with defaults):", error);
  }
  engineV2.reset();
  for (const plugin of config.connectors) {
    try {
      const pluginInstance = engineV2.initializePlugin(
        plugin.type as PluginRef,
        plugin.name as InstanceRef,
        plugin.params,
      );
      console.log(
        `Plugin initialized: ${pluginInstance.name} of type ${pluginInstance.pluginRef}`,
      );
    } catch (error) {
      console.error(`Error initializing plugin ${plugin.type}:`, error);
    }
  }

  const profiles = config.profiles ?? {};
  for (const [profileName, profileSpec] of Object.entries(profiles)) {
    try {
      const profileRef = profileName as SearchProfileRef;
      const profileConnectors = profileSpec.connectors.map(
        (connector) => connector as InstanceRef,
      );
      engineV2.initializeSearchProfile(profileRef, profileConnectors);
      console.log(
        `Profile initialized: ${profileRef} with connectors ${profileConnectors.join(", ")}`,
      );
    } catch (error) {
      console.error(`Error initializing profile ${profileName}:`, error);
    }
  }

  if (!("default" in profiles)) {
    console.warn(
      "No default profile found in configuration. Creating a default profile with first available connectors.",
    );
    const defaultProfileRef = "default" as SearchProfileRef;
    const defaultConnectors = engineV2
      .getInitializedPlugins()
      .map((plugin) => plugin.name)
      .slice(0, 1); // Use first available connector
    engineV2.initializeSearchProfile(defaultProfileRef, defaultConnectors);
    console.log(
      `Default profile created: ${defaultProfileRef} with connectors ${defaultConnectors.join(", ")}`,
    );
  }
};
