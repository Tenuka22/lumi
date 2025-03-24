import type { AppRouter } from "$lib/server/trpc/router/server";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import SuperJSON from "superjson";

let browserClient: ReturnType<typeof createTRPCProxyClient<AppRouter>>;

export const trpc = () => {
  const isBrowser = typeof window !== "undefined";

  if (isBrowser && browserClient) return browserClient;

  const token = localStorage.getItem("bearer_token");

  const client = createTRPCProxyClient<AppRouter>({
    transformer: SuperJSON,
    links: [
      httpBatchLink({
        url: `${process.env.SERVER_URL}/trpc`,
        headers: () => {
          const headersList: Record<string, string> = {};
          headersList["Authorization"] = `Bearer ${token}`;
          console.log(headersList);
          return headersList;
        },
      }),
    ],
  });

  if (isBrowser) browserClient = client;
  return client;
};
