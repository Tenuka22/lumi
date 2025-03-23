import { sequence } from "@sveltejs/kit/hooks";

import { auth } from "$lib/server/auth";
import type { Handle } from "@sveltejs/kit";
import { svelteKitHandler } from "better-auth/svelte-kit";

const authHandler: Handle = async ({ event, resolve }) => {
  const jwt = event.request.headers.get("set-auth-jwt");
  console.log(jwt);
  const session = await auth.api.getSession({
    headers: event.request.headers,
  });

  event.locals.session = session?.session;
  event.locals.user = session?.user;

  return svelteKitHandler({ event, resolve, auth });
};

export const handle = sequence(authHandler);
