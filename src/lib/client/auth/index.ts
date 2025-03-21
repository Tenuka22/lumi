import { createAuthClient, type SuccessContext } from "better-auth/svelte";
import { magicLinkClient } from "better-auth/client/plugins";
import { organizationClient } from "better-auth/client/plugins";
import { Effect } from "effect";

const onFetchSuccess = (ctx: SuccessContext) =>
  Effect.gen(function* () {
    const authToken = yield* Effect.sync(() =>
      ctx.response.headers.get("set-auth-token")
    );

    if (authToken) {
      yield* Effect.sync(() => localStorage.setItem("bearer_token", authToken));
    }
  });

export const authClient = createAuthClient({
  plugins: [magicLinkClient(), organizationClient()],
  fetchOptions: {
    onSuccess: async (ctx) => await Effect.runPromise(onFetchSuccess(ctx)),
    auth: {
      type: "Bearer",
      token: () =>
        Effect.runSync(
          Effect.sync(() => localStorage.getItem("bearer_token") || "")
        ),
    },
  },
});
