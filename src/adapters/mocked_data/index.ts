import { Adapter, newPluginRef, QueryProvider } from "~lib/adapters";
import { MockController } from "./controller";

const adapter: Adapter = {
    ref: newPluginRef('mocked_data'),
    name: "Mocked Data Adapter",
    description: "Adapter for mocked data",
    version: "0.1.0",
    params: [],
    factory: (): QueryProvider => {
        return MockController;
    },
}

export {
    adapter
};
