<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import { socialLogInSchema } from "$lib/valibot/forms";
  import {
    type SuperValidated,
    type Infer,
    superForm,
  } from "sveltekit-superforms";
  import { valibotClient } from "sveltekit-superforms/adapters";
  import * as Select from "$lib/components/ui/select";
  import { webAppConstants } from "$lib/constants/web-app";
  import { Globe } from "@lucide/svelte";
  import { Effect } from "effect";
  import { authClient } from "$lib/client/auth";
  import Spinner from "../ui/spinner/spinner.svelte";
  import { toast } from "svelte-sonner";
  import type { Writable } from "svelte/store";

  let {
    passedForm,
    formLoading,
  }: {
    passedForm: SuperValidated<Infer<typeof socialLogInSchema>>;
    formLoading: Writable<boolean>;
  } = $props();

  const form = superForm(passedForm, {
    validators: valibotClient(socialLogInSchema),
    onUpdate: async (event) =>
      Effect.runPromise(
        Effect.gen(function* () {
          const formData = event.form.data;

          const { error } = yield* Effect.promise(
            async () =>
              await authClient.signIn.social({
                provider: formData.provider,
              })
          );

          if (error)
            return toast.error(
              `Failed to connect with the social login : ${error?.message ?? "Unknown Error"}`
            );
        })
      ),
  });

  const { form: formData, enhance, submitting } = form;

  $effect(() => {
    $formLoading = $submitting;
  });
</script>

<form method="POST" use:enhance action="?/socialProvider" class="space-y-5">
  <Form.Field {form} name="provider">
    <Form.Control>
      {#snippet children({ props })}
        <Select.Root
          disabled={$formLoading}
          type="single"
          bind:value={$formData.provider}
          {...props}
        >
          <Select.Trigger {...props} class="h-11 capitalize">
            {$formData.provider
              ? $formData.provider
              : "Select a provider to continue"}
          </Select.Trigger>
          <Select.Content>
            {#each Object.values(webAppConstants.authProviders) as provider (provider)}
              <Select.Item
                class="capitalize h-11 px-4 flex items-center justify-between"
                value={provider}
                label={provider}
              />
            {/each}
          </Select.Content>
        </Select.Root>
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Button
    disabled={$formLoading}
    variant="outline"
    class="w-full h-11 gap-2"
    >Login with Provider
    {#if $submitting}
      <Spinner />
    {:else}
      <Globe />
    {/if}
  </Form.Button>
</form>
