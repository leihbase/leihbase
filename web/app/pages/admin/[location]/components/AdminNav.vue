<template>
  <HorizontalScroll is="nav" class="nav">
    <Button
      variant="secondary"
      :to="`/admin/${location?.slug}`"
      :class="{ active: isActive('') }"
    >
      {{ t("reservations") }}
    </Button>
    <Button
      variant="secondary"
      :to="`/admin/${location?.slug}/products`"
      :class="{ active: isActive('products') }"
    >
      {{ t("products") }}
    </Button>
    <Button
      variant="secondary"
      :to="`/admin/${location?.slug}/stats`"
      :class="{ active: isActive('stats') }"
    >
      {{ t("statistics") }}
    </Button>
    <Button
      variant="secondary"
      :to="`/admin/${location?.slug}/opening-hours`"
      :class="{ active: isActive('opening-hours') }"
    >
      {{ t("opening_hours") }}
    </Button>
    <Button
      :disabled="!userStore.isAdmin"
      variant="secondary"
      :to="`/admin/${location?.slug}/settings`"
      :class="{ active: isActive('settings') || isActive('email-templates') }"
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

const props = defineProps<{ location: RecordModel }>();
const route = useRoute();

// Make sure the active page is visible when the nav overflows on small screens
onMounted(() => {
  document
    .querySelector(".nav .active")
    ?.scrollIntoView({ block: "nearest", inline: "nearest" });
});

/**
 * If the given admin sub page (empty for the reservations overview) is the
 * current page
 */
function isActive(page: string) {
  const base = `/admin/${props.location?.slug}`;
  const path = route.path.replace(/\/$/, "");
  return page ? path.startsWith(`${base}/${page}`) : path === base;
}
</script>

<style scoped>
.nav :deep(a) {
  flex-shrink: 0;
  white-space: nowrap;
}
.nav :deep(.active) {
  background-color: var(--text-color);
  color: var(--background-color);
}
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
    "opening_hours": "Opening hours",
    "settings": "Settings",
    "email_templates": "Email Templates"
  },
  "de": {
    "reservations": "Reservierungen",
    "products": "Gegenständen",
    "statistics": "Statistieken",
    "opening_hours": "Öffnungszeiten",
    "settings": "Einstellungen",
    "email_templates": "E-Mail-Vorlagen"
  }
}
</i18n>
