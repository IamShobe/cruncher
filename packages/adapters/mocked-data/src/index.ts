import { Adapter, newPluginRef, QueryProvider } from "@cruncher/adapter-utils";
import { MockController } from "./controller";
import { z } from "zod/v4";

const paramsSchema = z.object({});

const adapter: Adapter = {
  ref: newPluginRef("mocked_data"),
  name: "Mocked Data Adapter",
  description: "Adapter for mocked data",
  version: "0.1.0",
  params: paramsSchema,
  factory: (): QueryProvider => {
    return MockController;
  },
};

export { adapter };
