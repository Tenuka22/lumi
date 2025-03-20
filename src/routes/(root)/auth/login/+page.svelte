<script lang="ts">
  import MagicLinkLoginForm from "$lib/components/forms/magic-link-login-form.svelte";
  import SocialLoginForm from "$lib/components/forms/social-login-form.svelte";
  import * as Dialog from "$lib/components/ui/dialog";
  import type { PageData } from "./$types";
  import logo from "$lib/assets/logo.svg";
  import { webAppConstants } from "$lib/constants/web-app";
  import { writable } from "svelte/store";

  export const formLoading = writable(false);
  let { data }: { data: PageData } = $props();
</script>

<Dialog.Root open onOpenChange={() => window.history.back()}>
  <Dialog.Content>
    <Dialog.Header class="flex flex-col items-center gap-2">
      <div
        class="flex size-11 shrink-0 items-center justify-center"
        aria-hidden="true"
      >
        <img src={logo} alt={webAppConstants.webName} />
      </div>
      <div>
        <Dialog.Title class="sm:text-center">Continue your journey</Dialog.Title
        >
        <Dialog.Description class="sm:text-center">
          Enter your credentials to login to your account.
        </Dialog.Description>
      </div>
    </Dialog.Header>

    <MagicLinkLoginForm {formLoading} passedForm={data.magicLinkform} />

    <div
      class="flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border"
    >
      <span class="text-xs text-muted-foreground">Or</span>
    </div>

    <SocialLoginForm
      {formLoading}
      passedForm={data.socialLoginform}
    /></Dialog.Content
  >
</Dialog.Root>
