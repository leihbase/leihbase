<template>
  <HorizontalScroll is="nav" class="nav">
    <Button variant="secondary" to="/admin" :active="path === '/admin'">
      {{ t("locations") }}
    </Button>
    <Button
      variant="secondary"
      to="/admin/settings"
      :active="path === '/admin/settings'"
    >
      {{ t("settings") }}
    </Button>
  </HorizontalScroll>
</template>

<script setup lang="ts">
import Button from "@/components/core/Button.vue";
import HorizontalScroll from "@/components/core/HorizontalScroll.vue";

const { t } = useI18n({ useScope: "local" });
const route = useRoute();
const path = computed(() => route.path.replace(/\/$/, ""));
</script>

<style scoped>
.nav :deep(a) {
  flex-shrink: 0;
  white-space: nowrap;
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
    "locations": "Locations",
    "settings": "Settings"
  },
  "de": {
    "locations": "Standorte",
    "settings": "Einstellungen"
  }
}
</i18n>
