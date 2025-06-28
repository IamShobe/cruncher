import { test, expect } from "vitest";
import adapter from ".";

test("import", () => {
  expect(adapter).toBeDefined();
});
