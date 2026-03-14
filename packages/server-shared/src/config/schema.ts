import { z } from "zod/v4";
import { DEFAULT_THEME } from "../themeDefaults.js";

export const ConnectorConfigSchema = z.object({
  type: z.string(), // e.g., 'grafana_browser'
  name: z.string(), // e.g., 'main'
  params: z.record(z.string(), z.any()), // Parameters specific to the connector
});

export const ProfilesSchema = z.record(
  z.string(), // Profile name
  z.object({
    connectors: z.array(z.string()), // List of connector names used in this profile
  }),
);

export const CruncherLokiConfigSchema = z.object({
  listenPort: z.number().optional().default(43100), // Optional port for Loki
  enabled: z.boolean().optional().default(false), // Optional flag to enable/disable Loki
});

export type CruncherLokiConfig = z.infer<typeof CruncherLokiConfigSchema>;

export const LIVE_INTERVAL_OPTIONS = ["1s", "3s", "5s", "10s"] as const;
export type LiveInterval = (typeof LIVE_INTERVAL_OPTIONS)[number];

export const LIVE_INTERVAL_MS: Record<LiveInterval, number> = {
  "1s": 1000,
  "3s": 3000,
  "5s": 5000,
  "10s": 10000,
};

export const TIMEZONE_OPTIONS = ["local", "utc"] as const;
export type TimezoneOption = (typeof TIMEZONE_OPTIONS)[number];

export const DEFAULT_MAX_HISTORY_ENTRIES = 100;

export const KeybindingOverrideSchema = z.object({
  Mac: z.string(),
  Windows: z.string(),
});
export type KeybindingOverride = z.infer<typeof KeybindingOverrideSchema>;

export const UIConfigSchema = z.object({
  theme: z
    .enum(["midnight", "nord", "dracula", "catppuccin"])
    .optional()
    .default(DEFAULT_THEME),
  liveInterval: z.enum(LIVE_INTERVAL_OPTIONS).optional().default("5s"),
  maxLogs: z.number().optional().default(100000),
  liveAutoStopMinutes: z.number().nullable().optional().default(30),
  timezone: z.enum(TIMEZONE_OPTIONS).optional().default("local"),
  maxHistoryEntries: z.number().nullable().default(DEFAULT_MAX_HISTORY_ENTRIES),
  keybindings: z
    .record(z.string(), KeybindingOverrideSchema)
    .optional()
    .default({}),
});

export type UIConfig = z.infer<typeof UIConfigSchema>;

export const CruncherConfigSchema = z.object({
  loki: CruncherLokiConfigSchema.optional(), // Optional Loki configuration
  profiles: ProfilesSchema.optional(),
  connectors: z.array(ConnectorConfigSchema),
  ui: UIConfigSchema.optional(),
});

export type CruncherConfig = z.infer<typeof CruncherConfigSchema>;
