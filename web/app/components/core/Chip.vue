<!--
  Compact label, optionally with a button to remove it, e.g. for a list of
  selected values
-->

<template>
  <span :class="{ chip: true, removable: !!removeLabel }">
    <slot />
    <button
      v-if="removeLabel"
      type="button"
      class="remove"
      :title="removeLabel"
      :aria-label="removeLabel"
      :data-testid="dataTestid ? `${dataTestid}-remove` : undefined"
      @click="emit('remove')"
    >
      <Xmark />
    </button>
  </span>
</template>

<script setup lang="ts">
import { Xmark } from "@iconoir/vue";

defineProps<{
  // Shows a remove button when set, used as its accessible label
  removeLabel?: string;
  dataTestid?: string;
}>();

const emit = defineEmits<{ remove: [] }>();
</script>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--border-radius);
  background-color: var(--secondary-color);
  color: var(--secondary-text-color);
  font-size: var(--font-size-sm);
}
.chip.removable {
  padding-right: var(--spacing-1);
}
.remove {
  display: inline-flex;
  padding: 0.15rem;
  border: 0;
  border-radius: var(--border-radius);
  background: transparent;
  color: inherit;
  cursor: pointer;
}
.remove:hover {
  background-color: color-mix(in srgb, var(--secondary-color) 80%, #000);
}
.remove svg {
  width: 1rem;
  height: 1rem;
}
</style>
