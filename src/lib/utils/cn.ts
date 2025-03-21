import { clsx, type ClassValue } from "clsx";
import { Effect } from "effect";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) =>
  Effect.runSync(
    Effect.sync(() => {
      return twMerge(clsx(inputs));
    })
  );
