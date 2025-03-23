import type { AppRouter } from "$lib/server/trpc/router/server";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import SuperJSON from "superjson";

let browserClient: ReturnType<typeof createTRPCProxyClient<AppRouter>>;

export const trpc = () => {
  const isBrowser = typeof window !== "undefined";
  if (isBrowser && browserClient) return browserClient;
  const client = createTRPCProxyClient<AppRouter>({
    transformer: SuperJSON,
    links: [
      httpBatchLink({
        url: "http://localhost:4000/trpc",
      }),
    ],
  });
  if (isBrowser) browserClient = client;
  return client;
};
