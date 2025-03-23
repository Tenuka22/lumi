import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "$lib/server/trpc/router/server";
import { createContext } from "$lib/server/trpc";

const app = new Hono();

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: createContext,
  })
);

export default {
  fetch: app.fetch,
  port: 4000,
};
