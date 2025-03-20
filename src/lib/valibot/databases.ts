import { user } from "$lib/db/schema";
import { createInsertSchema } from "drizzle-valibot";
import * as v from "valibot";

export const userInsertSchema = createInsertSchema(user, {
  email: (schema) => v.pipe(schema, v.email()),
});
