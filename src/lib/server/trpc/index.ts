import { db } from "$lib/db";
import type { RequestEvent } from "@sveltejs/kit";
import { initTRPC } from "@trpc/server";
import SuperJSON from "superjson";

export const createContext = async (event: RequestEvent) => {
  return {
    event,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: SuperJSON,
});

export const router = t.router;
export const middleware = t.middleware;

const dbMiddleware = middleware(async ({ ctx, next }) => {
  return next({
    ctx: {
      ...ctx,
      db,
    },
  });
});

export const publicProcedure = t.procedure;
export const publicDBProcedure = t.procedure.use(dbMiddleware);
export const mergeRouters = t.mergeRouters;
export const createCallerFactory = t.createCallerFactory;
