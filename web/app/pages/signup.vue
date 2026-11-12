<template>
  <Container width="sm" centered>
    <Card class="card lb-stack">
      <Heading is="h1" size="xl" cap data-testid="signup-h1">
        {{ t("title") }}
      </Heading>
      <i18n-t keypath="text" tag="p">
        <NuxtLink to="/login">{{ t("login_text") }}</NuxtLink>
      </i18n-t>
      <form @submit.prevent="handleSubmit" method="post">
        <Input
          id="name"
          name="name"
          :label="t('name')"
          type="text"
          data-testid="name-input"
          required
        />
        <Input
          id="email"
          name="email"
          :label="t('email')"
          type="email"
          data-testid="email-input"
          required
        />
        <Input
          id="password"
          name="password"
          :label="t('password')"
          type="password"
          data-testid="password-input"
          required
        />
        <Checkbox
          v-if="leihbase.privacy_policy_link"
          id="terms-and-conditions"
          name="terms"
          value="true"
          data-testid="tac-checkbox"
          required
          class="terms"
        >
          <i18n-t keypath="terms_and_conditions" tag="span">
            <NuxtLink target="_blank" :to="leihbase.privacy_policy_link">{{
              t("terms_and_conditions_link")
            }}</NuxtLink>
          </i18n-t>
        </Checkbox>

        <cap-widget
          v-if="cap.instanceHost && cap.siteKey"
          id="floating"
          :data-cap-api-endpoint="`https://${cap.instanceHost}/${cap.siteKey}/`"
        ></cap-widget>

        <sl-alert
          v-if="!!signupError"
          variant="danger"
          :open="!!signupError"
          data-testid="signup-error"
        >
          <sl-icon slot="icon" name="exclamation-octagon"></sl-icon>
          {{ signupError }}
        </sl-alert>
        <Button
          :loading="loading"
          size="lg"
          type="submit"
          data-testid="submit-button"
          data-cap-floating="#floating"
          data-cap-floating-position="bottom"
        >
          {{ t("submit") }}
        </Button>
      </form>
    </Card>
  </Container>
</template>

<script lang="ts" setup>
import Button from "@/components/core/Button.vue";
import Card from "@/components/core/Card.vue";
import Checkbox from "@/components/core/Checkbox.vue";
import Container from "@/components/core/Container.vue";
import Heading from "@/components/core/Heading.vue";
import Input from "@/components/core/Input.vue";
import { PageAlertType } from "@/components/page-alert/PageAlert.model";
import type { User } from "~~/models/user";
import { ClientResponseError } from "pocketbase";

const { t } = useI18n({ useScope: "local" });
const { pb, login } = usePocketbase();
const userStore = useUserStore();
const { leihbase } = useLeihbase();

const {
  public: { cap },
} = useRuntimeConfig();

const signupError = ref<string>();
const loading = ref(false);

if (import.meta.client) {
  await import("@shoelace-style/shoelace/dist/components/alert/alert.js");
  await import("@shoelace-style/shoelace/dist/components/icon/icon.js");

  if (cap.instanceHost && cap.siteKey) {
    await import("https://cdn.jsdelivr.net/npm/cap-widget@0.1.52");
    await import("https://cdn.jsdelivr.net/npm/cap-widget@0.1.52/cap-floating.min.js");
  }
}

useHead({
  title: t("page_title"),
});

async function handleSubmit(e: SubmitEvent) {
  const data = new FormData(e.target as HTMLFormElement);
  data.set("passwordConfirm", data.get("password") || "");
  signupError.value = undefined;
  loading.value = true;

  try {
    // Create account
    await pb.collection("users").create(data);

    // Send an email verification request
    await pb
      .collection("users")
      .requestVerification(data.get("email")!.toString());

    // Authenticate
    await login(
      data.get("email")!.toString(),
      data.get("password")!.toString()
    );

    // Login
    userStore.login({ user: pb.authStore.record as User });

    // Routing
    const { path, intent } = userStore.$state.authenticationIntent;
    if (path) {
      if (intent && intent === "reservation") {
        userStore.showBanner(PageAlertType.AFTER_SIGNUP_RESERVATION_INTENT);
      } else {
        userStore.showBanner(PageAlertType.AFTER_SIGNUP);
      }
      navigateTo(path);
    } else {
      userStore.showBanner(PageAlertType.AFTER_SIGNUP);
      navigateTo("/profile");
    }
  } catch (e) {
    console.log(e);
    loading.value = false;
    if (
      e instanceof ClientResponseError &&
      e.data?.data?.password?.code === "validation_length_out_of_range"
    ) {
      signupError.value = t("errors.password_length");
    } else if (
      e instanceof ClientResponseError &&
      e.data?.data?.email?.code === "validation_invalid_email"
    ) {
      signupError.value = t("errors.invalid_email");
    } else if (
      e instanceof ClientResponseError &&
      e.data?.data?.email?.code === "validation_not_unique"
    ) {
      signupError.value = t("errors.email_in_use");
    } else if (
      e instanceof ClientResponseError &&
      e.data?.message === "Terms_required."
    ) {
      signupError.value = t("errors.terms_required");
    } else if (
      e instanceof ClientResponseError &&
      e.data?.data?.message === "Captcha_invalid."
    ) {
      signupError.value = t("errors.captcha_invalid");
    } else {
      signupError.value = t("errors.general");
    }
  }
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/_breakpoints.scss";

form {
  max-width: var(--max-text-width);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
}
form sl-input {
  width: 100%;
}
sl-alert::part(base) {
  width: 100%;
}

.terms {
  padding: 0.5rem 0;
  width: 100%;
}
</style>

<i18n lang="json">
{
  "en": {
    "page_title": "Sign up",
    "title": "Sign up",
    "text": "Already have an account? {0}.",
    "login_text": "Sign in",
    "name": "Name",
    "email": "E-Mail",
    "password": "Password",
    "submit": "Sign up",
    "terms_and_conditions": "I have read and agree to the {0}, for the use of my personal data.",
    "terms_and_conditions_link": "data protection information",

    "errors": {
      "password_ength": "Password should be at least 8 characters long.",
      "invalid_email": "E-mail address is invalid or already in use.",
      "email_in_use": "There is already an account with this e-mail address.",
      "terms_required": "To proceed, you must agree to the data protection terms.",
      "captcha": "The website couldn't verify your request, please try again or contact us to resolve the issue.",
      "general": "An error occured during sign up, please try again."
    }
  },
  "de": {
    "page_title": "Registrieren",
    "title": "Registrieren",
    "text": "Du hast bereits ein Konto? {0}.",
    "login_text": "Einloggen",
    "name": "Name",
    "email": "E-Mail",
    "password": "Passwort",
    "terms_and_conditions": "Ich habe die {0}, zur Nutzung meiner personenbezogenen Daten gelesen und bin damit einverstanden.",
    "terms_and_conditions_link": "Datenschutzhinweisen",
    "submit": "Registrieren",
    "errors": {
      "password_length": "Dein Passwort sollte mindestens 8 Zeichen lang sein.",
      "invalid_email": "Die E-Mail ist ungültig oder wird bereits verwendet.",
      "email_in_use": "Es gibt bereits ein Konto mit dieser E-Mail-Adresse.",
      "terms_required": "Um fortzufahren, musst du den Datenschutzbestimmungen zustimmen.",
      "captcha": "Die Website konnte deine Anfrage nicht verifizieren. Versuch's bitte nochmal oder kontaktiere uns, um das Problem zu klären.",
      "general": "Beim Erstellen deiner Account ist ein Fehler aufgetreten, bitte versuche es erneut."
    }
  }
}
</i18n>
