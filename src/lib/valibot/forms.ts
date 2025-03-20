import { webAppConstants } from "$lib/constants/web-app";
import { userInsertSchema } from "./databases";
import * as v from "valibot";

export const logInFormSchema = v.pick(userInsertSchema, ["email", "name"]);
export const socialLogInSchema = v.object({
  provider: v.pipe(v.string(), v.enum(webAppConstants.authProviders)),
});
