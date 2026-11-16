<template>
  <Container width="sm" centered>
    <PageAlert />
    <Card class="lb-stack">
      <!-- Title -->
      <Heading is="h1" size="xl" cap>
        {{ t("change_password") }}
      </Heading>
      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="lb-stack">
        <!-- Current password -->
        <Input
          id="profile-edit-current-password-input"
          :label="t('current_password')"
          name="oldPassword"
          type="password"
          :error="fieldError('oldPassword')"
          required
        />
        <Divider spacing="md" />
        <!-- New password -->
        <Input
          id="profile-edit-new-password-input"
          :label="t('new_password')"
          name="password"
          type="password"
          :error="fieldError('password')"
          required
        />
        <!-- Confirm new password -->
        <Input
          id="profile-edit-confirm-password-input"
          :label="t('confirm_password')"
          name="passwordConfirm"
          type="password"
          :error="fieldError('passwordConfirm')"
          required
        />
        <!-- Buttons -->
        <div class="button-row">
          <Button to="/profile" variant="secondary">
            {{ t("cancel") }}
          </Button>
          <Button type="submit" :loading="loading" class="save-button">
            {{ t("save") }}
          </Button>
        </div>
      </form>
    </Card>
  </Container>
</template>

<script lang="ts" setup>
import Button from "@/components/core/Button.vue";
import Card from "@/components/core/Card.vue";
import Container from "@/components/core/Container.vue";
import Divider from "@/components/core/Divider.vue";
import Heading from "@/components/core/Heading.vue";
import Input from "@/components/core/Input.vue";
import PageAlert from "@/components/page-alert/PageAlert.vue";
import { ClientResponseError, type RecordModel } from "pocketbase";

const userStore = useUserStore();
const { pb, isValid, user, logout } = usePocketbase();
const { loading, update, fieldError } = usePocketbaseUpdate(pb, "users");
const { t } = useI18n({
  useScope: "local",
});

useHead({
  title: t("change_password"),
});

if (!isValid.value || !user.value) {
  logout();
  userStore.logout();
  navigateTo("/login");
}

async function handleSubmit(e: SubmitEvent) {
  const data = new FormData(e.target as HTMLFormElement);
  try {
    await update(user.value!.id, data);
    logout();
    userStore.logout();
    navigateTo("/login");
  } catch (e) {
    if (e instanceof ClientResponseError) {
      console.log(e.response);
    }
  }
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/_breakpoints.scss";

.button-row {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
</style>

<i18n lang="json">
{
  "en": {
    "change_password": "Change password",
    "current_password": "Current password",
    "new_password": "New password",
    "confirm_password": "Confirm new password",
    "cancel": "Cancel",
    "save": "Save"
  },
  "de": {
    "change_password": "Passwort ändern",
    "current_password": "Aktuelles Passwort",
    "new_password": "Neues Passwort",
    "confirm_password": "Neues Passwort bestätigen",
    "cancel": "Annulieren",
    "save": "Speichern"
  }
}
</i18n>
