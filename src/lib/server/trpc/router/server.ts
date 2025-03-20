import { createCallerFactory, mergeRouters } from "..";
import { userRouter } from "./user";

export const appRouter = mergeRouters(userRouter);

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
