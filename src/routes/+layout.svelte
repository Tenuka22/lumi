<script lang="ts">
  import "../lib/fonts/general-sans/general-sans.css";
  import "../app.css";
  import { webAppConstants } from "$lib/constants/web-app";
  import QueryWrapper from "$lib/components/wrapper/query-wrapper.svelte";
  import { Toaster } from "$lib/components/ui/sonner";
  let { children, data } = $props();
</script>

<svelte:head>
  <title>{webAppConstants.webName}</title>
</svelte:head>

<QueryWrapper {data}>
  {@render children()}
</QueryWrapper>

<Toaster />
