import { logInFormSchema, socialLogInSchema } from "$lib/valibot/forms";
import { superValidate } from "sveltekit-superforms";
import { valibot } from "sveltekit-superforms/adapters";
import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";

export const load: PageServerLoad = async () => {
  return {
    magicLinkform: await superValidate(valibot(logInFormSchema)),
    socialLoginform: await superValidate(valibot(socialLogInSchema)),
  };
};

export const actions: Actions = {
  magicLink: async (event) => {
    const form = await superValidate(event, valibot(logInFormSchema));

    if (!form.valid) {
      return fail(400, {
        form,
      });
    }
    return {
      form,
    };
  },
  socialProvider: async (event) => {
    const form = await superValidate(event, valibot(socialLogInSchema));
    console.log(form);
    if (!form.valid) {
      return fail(400, {
        form,
      });
    }
    return {
      form,
    };
  },
};
