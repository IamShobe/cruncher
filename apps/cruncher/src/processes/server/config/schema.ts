import { z } from "zod/v4";

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

export const CruncherConfigSchema = z.object({
  loki: CruncherLokiConfigSchema.optional(), // Optional Loki configuration
  profiles: ProfilesSchema.optional(),
  connectors: z.array(ConnectorConfigSchema),
});

export type CruncherConfig = z.infer<typeof CruncherConfigSchema>;
