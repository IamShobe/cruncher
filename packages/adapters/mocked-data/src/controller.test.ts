import { test, expect } from "vitest";
import mockedData from ".";

test("import", () => {
  expect(mockedData).toBeDefined();
});
