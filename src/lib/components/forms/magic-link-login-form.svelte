<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { logInFormSchema } from "$lib/valibot/forms";
  import {
    type SuperValidated,
    type Infer,
    superForm,
  } from "sveltekit-superforms";
  import { valibotClient } from "sveltekit-superforms/adapters";
  import { Mail } from "@lucide/svelte";
  import Spinner from "../ui/spinner/spinner.svelte";
  import { authClient } from "$lib/client/auth";
  import { Effect } from "effect";
  import { toast } from "svelte-sonner";
  import { writable, type Writable } from "svelte/store";
  import { debounce } from "$lib/hooks/debounce.svelte";
  import * as v from "valibot";
  import { trpc } from "$lib/trpc/client";
  import { page } from "$app/state";
  import { createMutation } from "@tanstack/svelte-query";
  import { Skeleton } from "../ui/skeleton";
  import { Separator } from "../ui/separator";

  let {
    formLoading,
    passedForm,
  }: {
    passedForm: SuperValidated<Infer<typeof logInFormSchema>>;
    formLoading: Writable<boolean>;
  } = $props();

  const emailExistsMutation = createMutation({
    mutationFn: async (email: string) =>
      await trpc(page).auth.ifEmailExists.mutate({ email }),
    mutationKey: ["emailExistsMutation"],
  });

  const currentView = writable<"magic-verify" | "magic-login">("magic-login");

  const form = superForm(passedForm, {
    validators: valibotClient(logInFormSchema),
    onUpdate: async (event) =>
      Effect.runPromise(
        Effect.gen(function* () {
          const formData = event.form.data;
          const { error } = yield* Effect.promise(
            async () =>
              await authClient.signIn.magicLink({
                email: formData.email,
                name: formData.name,
              })
          );
          if (error)
            return toast.error(
              `Failed to send the Login Link : ${error?.message ?? "Unknown Error"}`
            );

          return currentView.set("magic-verify");
        })
      ),
  });

  const { form: formData, enhance, submitting } = form;

  const checkEmailExists = debounce((email: string) => {
    $emailExistsMutation.mutate(email);
  }, 1000);

  $effect(() => {
    const parsedData = v.safeParse(v.pick(logInFormSchema, ["email"]), {
      email: $formData.email,
    });

    if (parsedData.success) {
      formLoading.set(true);
      checkEmailExists($formData.email);
      formLoading.set(false);
    }
  });

  $effect(() => {
    if ($currentView === "magic-verify") {
      formLoading.set(true);
    }
  });

  $effect(() => {
    formLoading.set($submitting);
  });
</script>

{#if $currentView === "magic-login"}
  <form method="POST" use:enhance action="?/magicLink" class="space-y-5">
    <Form.Field {form} name="email" class="gap-2">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Email</Form.Label>
          <Input
            class="h-11"
            placeholder="john.doe@acme.inc"
            {...props}
            bind:value={$formData.email}
          />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    {#if $emailExistsMutation.isPending}<div class="space-y-2">
        <Skeleton class="h-4 w-16" />
        <Skeleton class="h-11" />
      </div>
    {/if}

    {#if !$emailExistsMutation.isPending && !$emailExistsMutation.data?.emailExists}
      <Form.Field {form} name="name" class="gap-2">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Name</Form.Label>
            <Input
              disabled={$formLoading}
              class="h-11"
              placeholder="John Doe"
              {...props}
              bind:value={$formData.name}
            />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
    {/if}

    <Form.Button
      disabled={$formLoading}
      variant="outline"
      class="w-full h-11 gap-2"
    >
      Send Magic Link
      {#if $submitting}
        <Spinner />
      {:else}
        <Mail />
      {/if}
    </Form.Button>
  </form>
{:else}
  <Separator />
  <div class="flex items-center text-center justify-center flex-col py-4">
    <h2
      class="text-base flex items-center justify-center flex-row gap-2 flex-wrap text-muted-foreground font-semibold"
    >
      <Mail class="h-4 w-4" />Your Login Link has been Sent
    </h2>
    <p class="text-muted-foreground text-sm max-w-sm text-balance pt-2">
      Check your email provider's inbox. Check the spam folders if the email is
      missing
    </p>
  </div>{/if}
