import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  Tree,
} from "@nx/devkit";
import * as path from "path";
import { AdapterGeneratorGeneratorSchema } from "./schema";

export async function adapterGeneratorGenerator(
  tree: Tree,
  options: AdapterGeneratorGeneratorSchema,
) {
  const projectRoot = `packages/adapters/${options.name}`;
  addProjectConfiguration(tree, `@cruncher/adapter-${options.name}`, {
    root: projectRoot,
    projectType: "library",
    sourceRoot: `${projectRoot}/src`,
    targets: {},
  });
  generateFiles(tree, path.join(__dirname, "files"), projectRoot, {
    ...options,
    titleCaseWithController,
    titleCase,
  });
  await formatFiles(tree);
}

function titleCase(name: string): string {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function titleCaseWithController(name: string): string {
  return titleCase(name) + "Controller";
}

export default adapterGeneratorGenerator;
