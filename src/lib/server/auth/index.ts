import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema";
import { organization, jwt, magicLink, bearer } from "better-auth/plugins";
import { KeyvSqlite } from "@keyv/sqlite";
import { env } from "$env/dynamic/private";
import Keyv from "keyv";

const keyv = new Keyv<string>(new KeyvSqlite(env.KV_URL!));

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  secondaryStorage: {
    get: async (key) => {
      const value = await keyv.get(key);
      return value ? value : null;
    },
    set: async (key, value, ttl) => {
      if (ttl) await keyv.set(key, value, ttl);
      else await keyv.set(key, value);
    },
    delete: async (key) => {
      await keyv.delete(key);
    },
  },
  plugins: [
    jwt({
      jwt: {
        expirationTime: "1h",
      },
    }),
    bearer(),
    organization(),
    magicLink({
      sendMagicLink: async ({ email, token, url }, request) => {
        console.log("Sending magic link to", email, "with token", token);
        console.log("Magic link URL:", url);
        console.log("Request:", request);
      },
    }),
  ],
});
