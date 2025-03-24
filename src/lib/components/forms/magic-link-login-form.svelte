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
  import { Console, Effect } from "effect";
  import { writable, type Writable } from "svelte/store";
  import { debounce } from "$lib/hooks/debounce.svelte";
  import * as v from "valibot";
  import { trpc } from "$lib/trpc/client";
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
      await trpc().auth.ifEmailExists.mutate({ email }),
    mutationKey: ["emailExistsMutation"],
  });

  const currentView = writable<"magic-verify" | "magic-login">("magic-login");

  const onMagicLinkUpdate = (
    form: SuperValidated<Infer<typeof logInFormSchema>>
  ) =>
    Effect.gen(function* () {
      const formData = yield* Effect.succeed(form.data);

      const { error: magicLinkClientError } = yield* Effect.tryPromise({
        try: async () =>
          await authClient.signIn.magicLink({
            email: formData.email,
            name: formData.name,
          }),

        catch: () =>
          Effect.die(
            new Error(
              "Unknown Error occured while running the client magic link sending action."
            )
          ),
      });

      if (magicLinkClientError) {
        switch (
          magicLinkClientError.code as keyof typeof authClient.$ERROR_CODES
        ) {
          case "FAILED_TO_CREATE_USER":
            yield* Effect.die(
              new Error(
                "User account could not be created by the Magic Link login."
              )
            );
            break;
          case "FAILED_TO_CREATE_SESSION":
            yield* Effect.die(
              new Error(
                "User session could not be created by the Magic Link login."
              )
            );
            break;
          default:
            yield* Effect.die(
              new Error(
                "An unknown error occurred on the client during Magic Link login."
              )
            );
        }
      }

      return yield* Effect.succeed(currentView.set("magic-verify"));
    });

  const form = superForm(passedForm, {
    validators: valibotClient(logInFormSchema),
    onUpdate: async (event) =>
      await Effect.runPromise(onMagicLinkUpdate(event.form)).then(
        Console.log,
        Console.error
      ),
  });

  const { form: formData, enhance, submitting } = form;

  const checkEmailExists = debounce(
    (email: string) => $emailExistsMutation.mutate(email),
    1000
  );

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

  $effect(() => formLoading.set($submitting));
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

    {#if !$emailExistsMutation.isPending && !$emailExistsMutation.data?.data.emailExists}
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
