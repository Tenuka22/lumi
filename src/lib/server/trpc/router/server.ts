import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { createContext, mergeRouters, router } from "..";

const appRouter = mergeRouters(router({}));

export type AppRouter = typeof appRouter;

const server = createHTTPServer({
  router: appRouter,
  createContext,
});

server.listen(3000);
