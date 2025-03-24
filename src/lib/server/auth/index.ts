import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../../db";
import * as schema from "../../db/schema";
import { organization, magicLink, openAPI, jwt } from "better-auth/plugins";
import { KeyvSqlite } from "@keyv/sqlite";
import { env } from "$env/dynamic/private";
import Keyv from "keyv";
import { Effect } from "effect";
import { adminEmails } from "$lib/constants/admins";

const keyv = new Keyv<string>(new KeyvSqlite(env.KV_URL!));

const onMagicLinkSend = (email: string, url: string) =>
  Effect.gen(function* () {
    yield* Effect.succeed(
      console.log("Sending magic link to", email, "with url", url)
    );
  });

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
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const isUserAdmin = adminEmails.find((a) => user.email === a);
          const userObj = { ...user, role: isUserAdmin ? "admin" : "user" };
          return await { data: userObj };
        },
      },
    },
  },
  plugins: [
    jwt({
      jwt: {
        definePayload: ({ user }) => {
          return {
            id: user.id,
            email: user.email,
            role: user.role,
          };
        },
      },
    }),
    openAPI(),
    organization(),
    magicLink({
      sendMagicLink: async ({ email, url }) =>
        await Effect.runPromise(onMagicLinkSend(email, url)),
    }),
  ],
});
