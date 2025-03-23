import { db } from "$lib/db";
import { initTRPC } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { Context } from "hono";
import SuperJSON from "superjson";

export const createContext = async (
  _opts: FetchCreateContextFnOptions,
  c: Context
) => ({
  var1: c.env.MY_VAR1,
  var2: c.req.header("X-VAR2"),
  _opts,
  c,
});

export type AppContext = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<AppContext>().create({
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
