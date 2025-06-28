import fs from "node:fs/promises";
import { dirname, resolve } from "node:path";
import YAML from "yaml";
import { CruncherLokiConfig } from "../config/schema";
import { lokiLocationDir } from "./constants";

export const configLocation = resolve(lokiLocationDir, "loki.config.yaml");
export const dataDir = resolve(lokiLocationDir, "data");

const defaultConfig = {
  auth_enabled: false,
  server: {
    http_listen_port: 43100,
  },
  common: {
    path_prefix: dataDir,
    storage: {
      filesystem: {
        chunks_directory: resolve(dataDir, "chunks"),
        rules_directory: resolve(dataDir, "rules"),
      },
    },
    replication_factor: 1,
    ring: {
      kvstore: {
        store: "inmemory",
      },
    },
  },
  schema_config: {
    configs: [
      {
        from: "2023-01-01",
        store: "tsdb",
        object_store: "filesystem",
        schema: "v13",
        index: {
          prefix: "index_",
          period: "24h",
        },
      },
    ],
  },
  table_manager: {
    retention_deletes_enabled: true,
    retention_period: "168h",
  },
  compactor: {
    working_directory: resolve(dataDir, "compactor"),
    retention_enabled: true,
    retention_delete_delay: "2h",
    retention_delete_worker_count: 150,
    delete_request_store: "filesystem",
  },
  limits_config: {
    reject_old_samples_max_age: "168h",
    allow_structured_metadata: true,
    reject_old_samples: false,
  },
};

export const writeDefaultConfig = async (
  configPath: string,
  config: CruncherLokiConfig,
) => {
  try {
    const directory = dirname(configPath);
    await fs.mkdir(directory, { recursive: true });
    const copyConfig: typeof defaultConfig = JSON.parse(
      JSON.stringify(defaultConfig),
    );
    copyConfig.server.http_listen_port = config.listenPort ?? 43100;

    const configContent = YAML.stringify(copyConfig);
    await fs.writeFile(configPath, configContent, "utf8");

    console.log(`Default configuration written to ${configPath}`);
  } catch (error) {
    console.error(`Failed to write default configuration: ${error}`);
  }
};

export const initializeConfig = async (
  config: CruncherLokiConfig,
): Promise<typeof defaultConfig> => {
  try {
    await fs.access(configLocation);
    console.log(`Configuration file already exists at ${configLocation}`);
  } catch {
    console.log(
      `Configuration file not found, writing default config to ${configLocation}`,
    );
    await writeDefaultConfig(configLocation, config);
  }

  // read and parse the config file to ensure it's valid
  try {
    const configContent = await fs.readFile(configLocation, "utf8");
    const config = YAML.parse(configContent);
    if (!config || typeof config !== "object") {
      throw new Error("Invalid configuration format");
    }
    console.log("Configuration file is valid.");
    return config;
  } catch (error) {
    console.error(`Failed to read or parse configuration file: ${error}`);
    throw new Error("Configuration file is invalid or corrupted");
  }
};
