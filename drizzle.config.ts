import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  schema: "./src/lib/server/db/schema.ts",
  dbCredentials: { url: process.env.DATABASE_URL! },
  verbose: true,
  dialect: "postgresql",
  driver: "pglite",
});
