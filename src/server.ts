import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "$lib/server/trpc/router/server";
import { createContext } from "$lib/server/trpc";
import { PinoLogger, pinoLogger } from "hono-pino";

export interface AppBindings {
  Variables: {
    logger: PinoLogger;
  };
}
const app = new Hono<AppBindings>();

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: createContext,
  })
);

app.use(
  pinoLogger({
    pino: { level: "debug" },
  })
);

export default {
  fetch: app.fetch,
  port: 4000,
};
