<template>
  <HorizontalScroll is="nav" class="nav">
    <Button variant="secondary" :to="`/admin/${location?.slug}`">
      {{ t("reservations") }}
    </Button>
    <Button variant="secondary" :to="`/admin/${location?.slug}/products`">
      {{ t("products") }}
    </Button>
    <Button variant="secondary" :to="`/admin/${location?.slug}/stats`">
      {{ t("statistics") }}
    </Button>
    <Button
      :disabled="!userStore.isAdmin"
      variant="secondary"
      :to="`/admin/${location?.slug}/settings`"
    >
      {{ t("settings") }}
    </Button>
  </HorizontalScroll>
</template>

<script setup lang="ts">
import Button from "@/components/core/Button.vue";
import HorizontalScroll from "@/components/core/HorizontalScroll.vue";
import type { RecordModel } from "pocketbase";

const userStore = useUserStore();

const { t } = useI18n({
  useScope: "local",
});

defineProps<{ location: RecordModel }>();
</script>

<style scoped>
.nav {
  display: flex;
  gap: 0.5rem;
  margin-bottom: var(--fluid-spacing-8) !important;
}
</style>

<i18n lang="json">
{
  "en": {
    "reservations": "Reservations",
    "products": "Products",
    "statistics": "Statistics",
    "settings": "Settings",
    "email_templates": "Email Templates"
  },
  "de": {
    "reservations": "Reservierungen",
    "products": "Gegenständen",
    "statistics": "Statistieken",
    "settings": "Einstellungen",
    "email_templates": "E-Mail-Vorlagen"
  }
}
</i18n>
