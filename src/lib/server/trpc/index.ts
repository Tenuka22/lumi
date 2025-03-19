import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { initTRPC } from "@trpc/server";
import SuperJSON from "superjson";

export const createContext = async (opts: CreateNextContextOptions) => {
  console.info(opts);
  return {
    session: null,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: SuperJSON,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const mergeRouters = t.mergeRouters;
export const middleware = t.middleware;
