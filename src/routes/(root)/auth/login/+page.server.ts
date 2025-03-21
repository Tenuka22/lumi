import { logInFormSchema, socialLogInSchema } from "$lib/valibot/forms";
import { superValidate } from "sveltekit-superforms";
import { valibot } from "sveltekit-superforms/adapters";
import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { Effect } from "effect";

export const load: PageServerLoad = async () =>
  Effect.runPromise(
    Effect.gen(function* () {
      const magicLinkform = yield* Effect.promise(
        async () => await superValidate(valibot(logInFormSchema))
      );
      const socialLoginform = yield* Effect.promise(
        async () => await superValidate(valibot(socialLogInSchema))
      );

      return { magicLinkform, socialLoginform };
    })
  );

export const actions: Actions = {
  magicLink: async (event) =>
    await Effect.runPromise(
      Effect.gen(function* () {
        const form = yield* Effect.tryPromise({
          try: async () => await superValidate(event, valibot(logInFormSchema)),
          catch: () =>
            console.error(
              new Error(
                "Unknown Error occured while the super validate function runs to check the login form schema."
              )
            ),
        });

        if (!form.valid) {
          return fail(400, {
            form,
          });
        }
        return {
          form,
        };
      })
    ),
  socialProvider: async (event) =>
    await Effect.runPromise(
      Effect.gen(function* () {
        const form = yield* Effect.tryPromise({
          try: async () =>
            await superValidate(event, valibot(socialLogInSchema)),
          catch: () =>
            console.error(
              Effect.fail(
                new Error(
                  "Unknown Error occurred while the super validate function runs to check the social login form schema."
                )
              )
            ),
        });

        if (!form.valid) {
          return fail(400, {
            form,
          });
        }
        return {
          form,
        };
      })
    ),
};
