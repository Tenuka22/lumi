import type { AppRouter } from "$lib/server/trpc/router/server";
import SuperJSON from "superjson";
import { createTRPCClient, type TRPCClientInit } from "trpc-sveltekit";

let browserClient: ReturnType<typeof createTRPCClient<AppRouter>>;

export function trpc(init?: TRPCClientInit) {
  const isBrowser = typeof window !== "undefined";
  if (isBrowser && browserClient) return browserClient;
  const client = createTRPCClient<AppRouter>({ init, transformer: SuperJSON });
  if (isBrowser) browserClient = client;
  return client;
}
