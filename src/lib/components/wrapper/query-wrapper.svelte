<script lang="ts">
  import { QueryClientProvider } from "@tanstack/svelte-query";
  let { children, data } = $props();
</script>

<QueryClientProvider client={data.queryClient}>
  {@render children()}
</QueryClientProvider>
