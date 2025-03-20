import { userInsertSchema } from "$lib/valibot/databases";
import { eq } from "drizzle-orm";
import { publicDBProcedure, router } from "..";
import { user } from "$lib/db/auth-schema";
import * as v from "valibot";

const userAuthRouter = router({
  ifEmailExists: publicDBProcedure
    .input((input) => v.parse(v.pick(userInsertSchema, ["email"]), input))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const emailUser = await db
        .select({ id: user.id, email: user.email })
        .from(user)
        .where(eq(user.email, input.email));

      return {
        emailExists: emailUser.length > 0,
      };
    }),
});

export const userRouter = router({ auth: userAuthRouter });
