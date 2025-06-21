import { createTreeWithEmptyWorkspace } from "@nx/devkit/testing";
import { Tree, readProjectConfiguration } from "@nx/devkit";

import { adapterGeneratorGenerator } from "./adapter-generator";
import { AdapterGeneratorGeneratorSchema } from "./schema";

describe("adapter-generator generator", () => {
  let tree: Tree;
  const options: AdapterGeneratorGeneratorSchema = { name: "test" };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it("should run successfully", async () => {
    await adapterGeneratorGenerator(tree, options);
    const config = readProjectConfiguration(tree, "test");
    expect(config).toBeDefined();
  });
});
