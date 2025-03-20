import type { auth } from "$lib/server/auth";

export type AuthSocialProviders = Parameters<
  (typeof auth)["api"]["signInSocial"]
>["0"]["body"]["provider"];
