<script lang="ts">
  import "../lib/fonts/general-sans/general-sans.css";
  import "../app.css";
  import { webAppConstants } from "$lib/constants/web-app";
  let { children } = $props();
</script>

<svelte:head>
  <title>{webAppConstants.webName}</title>
</svelte:head>
{@render children()}
