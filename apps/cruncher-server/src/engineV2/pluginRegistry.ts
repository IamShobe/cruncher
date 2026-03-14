import z from "zod/v4";
import { v7 as uuidv7 } from "uuid";
import {
  Adapter,
  AdapterContext,
  ExternalAuthProvider,
  PluginRef,
} from "@cruncher/adapter-utils";
import { ParsedQuery } from "@cruncher/qql";
import {
  InstanceRef,
  PluginInstance,
  PluginInstanceContainer,
  SearchProfile,
  SearchProfileRef,
  SerializableAdapter,
} from "./types";

export class PluginRegistry {
  private supportedPlugins: Adapter[] = [];
  private initializedPlugins: PluginInstanceContainer[] = [];
  private searchProfiles: Record<SearchProfileRef, SearchProfile> = {};

  constructor(private authProvider: ExternalAuthProvider) {}

  registerPlugin(plugin: Adapter): void {
    if (this.supportedPlugins.some((p) => p.ref === plugin.ref)) {
      throw new Error(`Plugin with ref ${plugin.ref} is already registered`);
    }
    this.supportedPlugins.push(plugin);
    console.log(`Plugin registered: ${plugin.name} (${plugin.ref})`);
  }

  getSupportedPlugins(): SerializableAdapter[] {
    return this.supportedPlugins.map((plugin) => ({
      ref: plugin.ref,
      name: plugin.name,
      description: plugin.description,
      version: plugin.version,
      params: z.toJSONSchema(plugin.params),
    }));
  }

  findSupportedPlugin(ref: PluginRef): Adapter | undefined {
    return this.supportedPlugins.find((p) => p.ref === ref);
  }

  async getControllerParams(instanceId: InstanceRef) {
    const pluginContainer = this.initializedPlugins.find(
      (p) => p.instance.name === instanceId,
    );
    if (!pluginContainer) {
      throw new Error(`Plugin instance with id ${instanceId} not found`);
    }
    return await pluginContainer.provider.getControllerParams();
  }

  async getParamValueSuggestions(
    instanceId: InstanceRef,
    field: string,
    indexes: string[],
  ): Promise<string[]> {
    const container = this.initializedPlugins.find(
      (p) => p.instance.name === instanceId,
    );
    if (!container?.provider.getDynamicSuggestions) return [];
    return await container.provider.getDynamicSuggestions(field, indexes);
  }

  getInitializedPlugins(): PluginInstance[] {
    return this.initializedPlugins.map((p) => p.instance);
  }

  getSearchProfiles(): SearchProfile[] {
    return Object.values(this.searchProfiles);
  }

  getSearchProfile(name: SearchProfileRef): SearchProfile | undefined {
    return this.searchProfiles[name];
  }

  reset(): void {
    this.initializedPlugins = [];
    this.searchProfiles = {};
  }

  initializePlugin(
    pluginRef: PluginRef,
    name: InstanceRef,
    params: Record<string, unknown>,
  ): PluginInstance {
    const plugin = this.supportedPlugins.find((p) => p.ref === pluginRef);
    if (!plugin) {
      throw new Error(`Plugin with ref ${pluginRef} not found`);
    }

    const adapterContext: AdapterContext = {
      externalAuthProvider: this.authProvider,
    };
    const instance = plugin.factory(adapterContext, { params });
    if (!instance) {
      throw new Error(`Failed to create instance for plugin ${pluginRef}`);
    }

    const pluginInstance: PluginInstance = {
      id: uuidv7(),
      name,
      description: plugin.description,
      pluginRef: plugin.ref,
    };

    this.initializedPlugins.push({ instance: pluginInstance, provider: instance });
    return pluginInstance;
  }

  initializeSearchProfile(
    name: SearchProfileRef,
    instances: InstanceRef[],
  ): SearchProfile {
    for (const instance of instances) {
      if (!this.initializedPlugins.some((p) => p.instance.name === instance)) {
        throw new Error(`Plugin instance with name ${instance} not found`);
      }
    }
    const searchProfile: SearchProfile = { name, instances };
    this.searchProfiles[name] = searchProfile;
    return searchProfile;
  }

  getInstancesToQueryOn(
    searchProfileRef: SearchProfileRef,
    parsedTree: ParsedQuery,
  ): PluginInstanceContainer[] {
    const selectedProfile = this.searchProfiles[searchProfileRef];
    if (parsedTree.dataSources.length === 0) {
      return this.initializedPlugins.filter((p) =>
        selectedProfile.instances.includes(p.instance.name),
      );
    }
    const dataSources = parsedTree.dataSources.map((ds) => ds.name);
    return this.initializedPlugins.filter(
      (p) =>
        dataSources.includes(p.instance.name) &&
        selectedProfile.instances.includes(p.instance.name),
    );
  }
}
