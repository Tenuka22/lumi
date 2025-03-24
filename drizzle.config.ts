import { defineConfig } from "drizzle-kit";
import { Config, Effect } from "effect";
import * as v from "valibot";
import dotenv from "dotenv";
import { PrettyValueOf } from "./src/lib/types";

dotenv.config();

const drizzleConfigGen = Effect.gen(function* () {
  const schemaURL = yield* Config.string("DATABASE_SCHEMA_URL").pipe(
    Config.withDefault("./src/lib/db/schema.ts")
  );
  const databaseURL = yield* Config.string("DATABASE_URL");

  const pgDrivers = yield* Effect.succeed(
    v.enum({
      aws: "aws-data-api",
      pglite: "pglite",
    } as const)
  );

  const drizzleDialects = yield* Effect.succeed(
    v.enum({
      pg: "postgresql",
    } as const)
  );

  const driver = yield* Config.string("DATABASE_DRIVER").pipe(
    Config.withDefault("pglite"),
    Config.validate({
      validation: (value) => v.safeParse(pgDrivers, value).success,
      message:
        "Invalid driver selected for DATABASE_DRIVER. Please choose one of the following: aws, pglite.",
    })
  );

  const dialect = yield* Config.string("DATABASE_DIALECT").pipe(
    Config.withDefault("postgresql"),
    Config.validate({
      validation: (value) => v.safeParse(drizzleDialects, value).success,
      message:
        "Invalid dialect selected for DATABASE_DIALECT. Please choose 'pg' for PostgreSQL.",
    })
  );

  const verbose = yield* Config.boolean("DATABASE_DEBUG_MODE").pipe(
    Config.withDefault(true)
  );

  const config = yield* Effect.sync(() =>
    defineConfig({
      verbose,
      schema: schemaURL,
      dbCredentials: { url: databaseURL },
      dialect: dialect as PrettyValueOf<(typeof drizzleDialects)["enum"]>,
      driver: driver as PrettyValueOf<(typeof pgDrivers)["enum"]>,
    })
  );

  return config;
});

const drizzleConfig = Effect.runSync(drizzleConfigGen);

export default drizzleConfig;
