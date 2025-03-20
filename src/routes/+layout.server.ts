import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, url }) => {
  const session = locals.session;
  const user = locals.user;

  if (url.pathname.endsWith("/login") && session) redirect(303, "/");

  return { session, user };
};
