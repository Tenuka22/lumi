import { env } from "$env/dynamic/private";
import { drizzle } from "drizzle-orm/pglite";

export const db = drizzle(env.DATABASE_URL);
