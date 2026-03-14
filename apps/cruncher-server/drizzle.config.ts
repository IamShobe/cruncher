import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/engineV2/localstate/schema.ts",
  out: "./src/engineV2/localstate/migrations",
  dialect: "sqlite",
});
