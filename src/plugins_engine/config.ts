import fs from "node:fs";
import { CruncherConfigSchema } from "src/config/schema";
import { Engine } from "src/engineV2/engine";
import { InstanceRef, SearchProfileRef } from "src/engineV2/types";
import YAML from 'yaml';
import { PluginRef } from "~lib/adapters";


const configFilePath = 'cruncher.config.yaml';

// file should be in ~/.config/cruncher/cruncher.config.yaml

const defaultConfigFilePath = `${process.env.HOME}/.config/cruncher/${configFilePath}`;


export type AppGeneralSettings = {
    configFilePath: string;
}

export const appGeneralSettings: AppGeneralSettings = {
    configFilePath: defaultConfigFilePath,
};


export const setupPluginsFromConfig = (appGeneralSettings: AppGeneralSettings, engineV2: Engine) => {
    // load default plugins from cruncher.config.yaml file

    // read file content
    if (!fs.existsSync(appGeneralSettings.configFilePath)) {
        console.warn(`Configuration file not found at ${appGeneralSettings.configFilePath}`);
        return;
    }

    const fileContent = fs.readFileSync(appGeneralSettings.configFilePath, 'utf8');

    // parse YAML content
    const config = YAML.parse(fileContent);

    const validated = CruncherConfigSchema.safeParse(config);
    if (!validated.success) {
        console.error("Invalid configuration file:", validated.error);
        return;
    }

    engineV2.reset();
    for (const plugin of validated.data.connectors) {
        try {
            const pluginInstance = engineV2.initializePlugin(plugin.type as PluginRef, plugin.name as InstanceRef, plugin.params);
            console.log(`Plugin initialized: ${pluginInstance.name} of type ${pluginInstance.pluginRef}`);
        } catch (error) {
            console.error(`Error initializing plugin ${plugin.type}:`, error);
        }
    }

    const profiles = validated.data.profiles ?? {};
    for (const [profileName, profileSpec] of Object.entries(profiles)) {
        try {
            const profileRef = profileName as SearchProfileRef;
            const profileConnectors = profileSpec.connectors.map(connector => connector as InstanceRef);
            engineV2.initializeSearchProfile(profileRef, profileConnectors);
            console.log(`Profile initialized: ${profileRef} with connectors ${profileConnectors.join(', ')}`);
        } catch (error) {
            console.error(`Error initializing profile ${profileName}:`, error);
        }
    }

    if (!("default" in profiles)) {
        console.warn("No default profile found in configuration. Creating a default profile with first available connectors.");
        const defaultProfileRef = "default" as SearchProfileRef;
        const defaultConnectors = engineV2.getInitializedPlugins().map(plugin => plugin.name).slice(0, 1); // Use first available connector
        engineV2.initializeSearchProfile(defaultProfileRef, defaultConnectors);
        console.log(`Default profile created: ${defaultProfileRef} with connectors ${defaultConnectors.join(', ')}`);
    }
}
