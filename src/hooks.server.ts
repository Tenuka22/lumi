import { sequence } from "@sveltejs/kit/hooks";
import { auth } from "$lib/server/auth";
import type { Handle } from "@sveltejs/kit";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { Effect } from "effect";

const authHandler: Handle = async ({ event, resolve }) =>
  Effect.runPromise(
    Effect.gen(function* () {
      const headers = new Headers(event.request.headers);

      const token = yield* Effect.promise(async () => {
        return await auth.api.getJwks({
          headers,
        });
      });

      headers.append("Authorization", `Bearer ${token}`);

      const session = yield* Effect.promise(async () => {
        return await auth.api.getSession({
          headers,
        });
      });

      event.locals.session = yield* Effect.sync(() => session?.session);
      event.locals.user = yield* Effect.sync(() => session?.user);

      return svelteKitHandler({ event, resolve, auth });
    })
  );

export const handle = sequence(authHandler);
