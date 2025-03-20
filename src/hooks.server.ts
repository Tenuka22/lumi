import { sequence } from "@sveltejs/kit/hooks";

import { auth } from "$lib/server/auth";
import { createContext } from "$lib/server/trpc";
import { appRouter } from "$lib/server/trpc/router/server";
import type { Handle } from "@sveltejs/kit";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { createTRPCHandle } from "trpc-sveltekit";

const authHandler: Handle = async ({ event, resolve }) => {
  const session = await auth.api.getSession({
    headers: event.request.headers,
  });
  event.locals.session = session?.session;
  event.locals.user = session?.user;
  return svelteKitHandler({ event, resolve, auth });
};

const trpcHandler: Handle = createTRPCHandle({
  router: appRouter,
  createContext,
});

export const handle = sequence(authHandler, trpcHandler);
