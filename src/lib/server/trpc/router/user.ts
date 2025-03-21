import { userInsertSchema } from "$lib/valibot/databases";
import { eq } from "drizzle-orm";
import { publicDBProcedure, router } from "..";
import { user } from "$lib/db/auth-schema";
import * as v from "valibot";
import { Effect } from "effect";

const userAuthRouter = router({
  ifEmailExists: publicDBProcedure
    .input((input) => v.parse(v.pick(userInsertSchema, ["email"]), input))
    .mutation(
      async ({ ctx, input }) =>
        await Effect.runPromise(
          Effect.gen(function* () {
            const { db } = yield* Effect.succeed(ctx);

            const emailUser = yield* Effect.tryPromise({
              try: async () =>
                await db
                  .select({ id: user.id, email: user.email })
                  .from(user)
                  .where(eq(user.email, input.email)),
              catch: () => ({
                error: {
                  message:
                    "Unknown Error occured while running the server ifEmailExists action.",
                },
                data: null,
              }),
            });

            return {
              data: { emailExists: emailUser.length > 0 },
              error: null,
            };
          })
        )
    ),
});

export const userRouter = router({ auth: userAuthRouter });
