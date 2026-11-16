<template>
  <Container width="sm" centered>
    <PageAlert />
    <Card class="lb-stack">
      <!-- Title -->
      <Heading is="h1" size="xl" cap>{{ t("edit_profile") }}</Heading>
      <!-- Form -->
      <form @submit.prevent="handleSubmit">
        <!-- Name -->
        <Input
          id="profile-edit-name-input"
          :label="t('name')"
          name="name"
          :value="user!.name"
          :error="fieldError('name')"
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
import Heading from "@/components/core/Heading.vue";
import Input from "@/components/core/Input.vue";
import PageAlert from "@/components/page-alert/PageAlert.vue";
import { ClientResponseError, type RecordModel } from "pocketbase";

const { pb, isValid, user, logout } = usePocketbase();
const userStore = useUserStore();
const { loading, update, fieldError } = usePocketbaseUpdate(pb, "users");
const { t } = useI18n({
  useScope: "local",
});

useHead({
  title: t("edit_profile"),
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
    navigateTo("/profile");
  } catch (e) {
    if (e instanceof ClientResponseError) {
      console.log(e.response);
    }
  }
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/_breakpoints.scss";

form {
  display: flex;
  flex-direction: column;
  gap: var(--fluid-spacing-6);
}

.button-row {
  display: flex;
  justify-content: flex-end;
  gap: var(--fluid-spacing-4);
}
</style>

<i18n lang="json">
{
  "en": {
    "edit_profile": "Edit profile",
    "name": "Name",
    "cancel": "Cancel",
    "save": "Save"
  },
  "de": {
    "edit_profile": "Profil bearbeiten",
    "name": "Name",
    "cancel": "Annulieren",
    "save": "Speichern"
  }
}
</i18n>
