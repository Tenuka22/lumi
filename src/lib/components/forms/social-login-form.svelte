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
  import { Console, Effect } from "effect";
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

  const onSocialLogInUpdata = (
    form: SuperValidated<Infer<typeof socialLogInSchema>>
  ) =>
    Effect.gen(function* () {
      const formData = yield* Effect.succeed(form.data);

      const { error: socialClientError } = yield* Effect.tryPromise({
        try: async () =>
          await authClient.signIn.social({
            provider: formData.provider,
          }),
        catch: () =>
          console.error(
            new Error(
              "Unknown Error occured while connecting to the " +
                formData.provider +
                " provider."
            )
          ),
      });

      if (socialClientError) {
        switch (
          socialClientError.code as keyof typeof authClient.$ERROR_CODES
        ) {
          case "FAILED_TO_CREATE_USER":
            yield* Effect.die(
              new Error(
                "User account could not be created by the Social login from " +
                  formData.provider +
                  " provider."
              )
            );
            break;
          case "FAILED_TO_CREATE_SESSION":
            yield* Effect.die(
              new Error(
                "User session could not be created by the Social login from " +
                  formData.provider +
                  " provider."
              )
            );
            break;
          default:
            yield* Effect.die(
              new Error(
                "An unknown error occurred on the client during Social login from " +
                  formData.provider +
                  " provider."
              )
            );
        }
      }
    });

  const form = superForm(passedForm, {
    validators: valibotClient(socialLogInSchema),
    onUpdate: async (event) =>
      await Effect.runPromise(onSocialLogInUpdata(event.form)).then(
        Console.log,
        Console.error
      ),
    onError: (event) => {
      toast.error(event.result.error.message);
    },
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
