import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema:
    "./src/processes/server/engineV2/localstate/schema.ts",
  out: "./src/processes/server/engineV2/localstate/migrations",
  dialect: "sqlite",
});
