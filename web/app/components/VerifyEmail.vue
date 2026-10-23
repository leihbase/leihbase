<template>
  <div class="lb-stack">
    <!-- Already verified -->
    <p v-if="user?.verified">{{ t("already_verified") }}</p>
    <slot v-if="user?.verified" name="verified"></slot>

    <!-- Not yet verified -->
    <p v-if="!user?.verified">
      {{ t("not_verified") }}
    </p>

    <!-- Success -->
    <Alert v-if="success" variant="success">{{ t("success") }}</Alert>

    <!-- Error -->
    <Alert v-if="error" variant="error">{{ error }}</Alert>

    <!-- Send email button -->
    <Button
      v-if="!user?.verified && !success"
      :loading="loading"
      @click="handleRequest"
    >
      {{ t("resend") }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import Alert from "@/components/core/Alert.vue";
import Button from "@/components/core/Button.vue";

const { pb, user } = usePocketbase();
const { t } = useI18n({ useScope: "local" });

const success = ref(false);
const error = ref<string>();
const loading = ref(false);

async function handleRequest() {
  loading.value = true;
  try {
    await pb
      .collection("users")
      .requestVerification(pb.authStore?.record?.email);
    success.value = true;
  } catch (e) {
    error.value = t("general_error");
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/_breakpoints.scss";

p {
  margin: 0;
}
</style>

<i18n lang="json">
{
  "en": {
    "already_verified": "Your e-mail address is already verified!",
    "not_verified": "Your e-mail address is not yet verified. You find a verification e-mail in your inbox, or request a new verification e-mail using the button below.",
    "resend": "Resend verification e-mail",
    "general_error": "Something went wrong while sending a new verification e-mail. Try again later, or contact us to resolve the issue.",
    "success": "A new verification e-mail has been sent!"
  },
  "de": {
    "already_verified": "Deine E-Mail-Adresse ist bereits bestätigt!",
    "not_verified": "Deine E-Mail-Adresse ist noch nicht bestätigt. Du findest eine Bestätigungs-E-Mail in deinem Posteingang, oder fordere eine neue Bestätigungs-E-Mail über den untenstehenden Button an.",
    "resend": "Bestätigungs-E-Mail erneut senden",
    "general_error": "Beim Verschicken der Bestätigungs-Mail gab es ein Problem. Versuch es später erneut, oder kontaktiere uns um das Problem zu beheben.",
    "success": "Eine neue Bestätigungs-Mail wurde gesendet!"
  }
}
</i18n>
