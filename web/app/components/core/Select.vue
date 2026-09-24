<template>
  <div :class="{ root: true, ['orientation-' + orientation]: true }">
    <label :for="`select-${id}`" :class="hideLabel ? 'sr-only' : ''">
      {{ label }}
    </label>
    <div class="select">
      <select :id="`select-${id}`" v-bind="$attrs" v-model="model">
        <slot />
      </select>
      <NavArrowDown />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NavArrowDown } from "@iconoir/vue";

defineOptions({
  inheritAttrs: false,
});
withDefaults(
  defineProps<{
    label: string;
    name: string;
    required?: boolean;
    disabled?: boolean;
    hideLabel?: boolean;
    orientation?: "vertical" | "horizontal";
  }>(),
  {
    orientation: "vertical",
  }
);
const id = useId();
const model = defineModel();
</script>

<style scoped>
.root {
  --arrow-height: 1.2rem;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.66rem;
}
.orientation-horizontal {
  flex-direction: row;
  align-items: center;
}
label {
  font-weight: var(--font-weight-bold);
}
.select {
  position: relative;
  display: inline-block;
}
select {
  appearance: none;
  background: transparent;
  border: 0;
  background-color: var(--secondary-color);
  color: var(--secondary-text-color);
  padding: 0.5rem 2.5rem 0.5rem 1rem;
  border-radius: var(--border-radius);
  cursor: pointer;
}
select[disabled] {
  cursor: default;
}
select:not([disabled]):hover,
select:focus-visible {
  outline: 2px solid var(--text-color);
}
svg {
  position: absolute;
  height: var(--arrow-height);
  right: 0.33rem;
  top: calc(50% - (var(--arrow-height) / 2));
  pointer-events: none;
}
</style>
