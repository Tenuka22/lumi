import { browser } from "$app/environment";
import { QueryClient } from "@tanstack/svelte-query";
import type { LayoutLoad } from "./$types";
import { Effect } from "effect";

export const load: LayoutLoad = async () =>
  Effect.runSync(
    Effect.sync(() => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            enabled: browser,
          },
        },
      });

      return { queryClient };
    })
  );
