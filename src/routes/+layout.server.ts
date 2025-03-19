import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  const session = locals.session;
  const user = locals.user;

  return { session, user };
};
