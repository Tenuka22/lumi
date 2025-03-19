import type { AppRouter } from "$lib/server/trpc/router/server";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import SuperJSON from "superjson";

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000",
      transformer: SuperJSON,
    }),
  ],
});
