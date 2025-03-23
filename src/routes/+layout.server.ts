import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { Effect } from "effect";

export const load: LayoutServerLoad = async ({ locals, url }) => {
  console.log("layout load");

  if (url.pathname.endsWith("/login") && locals.user) {
    throw redirect(303, "/");
  }

  return await Effect.runPromise(
    Effect.gen(function* () {
      const session = yield* Effect.succeed(locals.session);
      const user = yield* Effect.succeed(locals.user);
      return { session, user };
    })
  );
};
