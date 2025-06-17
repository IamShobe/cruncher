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
  })
);

export const CruncherConfigSchema = z.object({
  profiles: ProfilesSchema.optional(),
  connectors: z.array(ConnectorConfigSchema),
});
