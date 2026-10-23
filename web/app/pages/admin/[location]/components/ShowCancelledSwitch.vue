<template>
  <Switch
    :id="id"
    class="show-cancelled"
    :label="t('show_cancelled')"
    orientation="horizontal"
    v-model="model"
  />
</template>

<script lang="ts" setup>
import Switch from "@/components/core/Switch.vue";

const { t } = useI18n({
  useScope: "local",
});

defineProps<{ id: string }>();

const model = defineModel<boolean>({ default: false });
</script>

<style lang="scss" scoped>
@use "@/assets/styles/breakpoints.scss";

.show-cancelled {
  width: auto;
}
@media screen and (min-width: breakpoints.$breakpoint-md) {
  .show-cancelled {
    margin-left: auto;
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "show_cancelled": "Show cancelled"
  },
  "de": {
    "show_cancelled": "Stornierungen anzeigen"
  }
}
</i18n>
