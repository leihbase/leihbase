<template>
  <component :is="is" class="label" :for="for">
    <slot />
    <span v-if="!required && !hideRequired">&nbsp;({{ t("optional") }})</span>
    <span class="suffix">
      <slot name="suffix" />
    </span>
  </component>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    is?: string;
    for?: string;
    required?: boolean;
    hideRequired?: boolean;
  }>(),
  {
    is: "label",
    required: false,
    hideRequired: false,
  }
);
const { t } = useI18n({
  useScope: "local",
});
</script>

<style scoped>
.label {
  display: flex;
  align-items: center;
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-2);
}
.label span {
  font-weight: var(--font-weight-normal);
  color: var(--text-color-light);
}
.label .suffix {
  margin-left: auto;
}
</style>

<i18n lang="json">
{
  "en": {
    "optional": "optional"
  },
  "de": {
    "optional": "optional"
  }
}
</i18n>
