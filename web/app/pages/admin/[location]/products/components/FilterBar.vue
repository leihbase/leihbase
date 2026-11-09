<template>
  <HorizontalScroll class="filter-bar">
    <!-- Status filter -->
    <Select :label="t('status')" orientation="horizontal" v-model="status">
      <option value="">{{ t("all") }}</option>
      <option value="active">{{ t("active") }}</option>
      <option value="inactive">{{ t("inactive") }}</option>
    </Select>
    <!-- Completeness filter -->
    <Select
      :label="t('missing_info')"
      orientation="horizontal"
      v-model="missing"
    >
      <option value="">{{ t("all") }}</option>
      <option value="photo">{{ t("no_photo") }}</option>
      <option value="description">{{ t("no_description") }}</option>
    </Select>
    <!-- Text filter -->
    <Input
      id="admin-product-input"
      :placeholder="`${t('search')}...`"
      v-model="query"
      class="text-search"
    />
    <!-- Clear filter button -->
    <Button
      v-if="status || missing || query"
      variant="secondary"
      class="clear-filters"
      @click="
        status = '';
        missing = '';
        query = '';
      "
    >
      <Xmark />
      {{ t("clear_filters") }}
    </Button>
  </HorizontalScroll>
</template>

<script lang="ts" setup>
import Button from "@/components/core/Button.vue";
import HorizontalScroll from "@/components/core/HorizontalScroll.vue";
import Input from "@/components/core/Input.vue";
import Select from "@/components/core/Select.vue";
import { Xmark } from "@iconoir/vue";

const { t } = useI18n({
  useScope: "local",
});
const status = defineModel("status");
const missing = defineModel("missing");
const query = defineModel("query");
</script>

<style lang="scss" scoped>
.filter-bar {
  margin-bottom: var(--fluid-spacing-8) !important;
  display: flex;
  gap: var(--fluid-spacing-4);
}
.filter-bar :deep(label) {
  white-space: nowrap;
}
.text-search {
  width: auto !important;
  min-width: 200px;
}
.no-photos {
  width: auto;
}
.clear-filters {
  flex-shrink: 0;
}
</style>

<i18n lang="json">
{
  "en": {
    "status": "Status",
    "all": "All",
    "active": "Active",
    "inactive": "Inactive",
    "missing_info": "Missing info",
    "no_photo": "No photo",
    "no_description": "No description",
    "search": "Search",
    "clear_filters": "Clear filters"
  },
  "de": {
    "status": "Status",
    "all": "Alle",
    "active": "Aktiv",
    "inactive": "Inaktiv",
    "missing_info": "Fehlende Infos",
    "no_photo": "Kein Foto",
    "no_description": "Keine Beschreibung",
    "search": "Suche",
    "clear_filters": "Filter zurücksetzen"
  }
}
</i18n>
