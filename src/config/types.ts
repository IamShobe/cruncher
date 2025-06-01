import { z } from 'zod';

export const ConnectorConfigSchema = z.object({
    type: z.string(), // e.g., 'grafana_browser'
    name: z.string(), // e.g., 'main'
    params: z.record(z.any()), // Parameters specific to the connector
});

export const CruncherConfigSchema = z.object({
    connectors: z.array(ConnectorConfigSchema),
});

