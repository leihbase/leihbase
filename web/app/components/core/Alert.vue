<template>
  <div :class="{ alert: true, [variant]: true, [`size-${size}`]: true }">
    <ThumbsUp v-if="variant === 'success'" />
    <WarningTriangle v-else-if="variant === 'warning'" />
    <InfoCircle v-else-if="variant === 'info'" />
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { InfoCircle, ThumbsUp, WarningTriangle } from "@iconoir/vue";
import type { HTMLAttributes } from "vue";

/**
 * Native attributes (e.g. `data-testid`) which fall through to the root
 * element. Only used for type checking, see `@vue-ignore`.
 */
interface NativeAttributes extends HTMLAttributes {
  // data-* attributes, camelized by Vue
  [dataAttribute: `data${Capitalize<string>}`]: unknown;
}

interface Props extends /* @vue-ignore */ NativeAttributes {
  variant?: "success" | "error" | "warning" | "info";
  size?: "sm" | "md";
}

withDefaults(defineProps<Props>(), {
  variant: "success",
  size: "md",
});
</script>

<style lang="scss" scoped>
.alert {
  padding: 1rem 1.25rem;
  border-radius: var(--border-radius);
  display: flex;
  gap: 1rem;
  &.success {
    background-color: var(--surface-success-color);
  }
  &.warning {
    background-color: var(--surface-warning-color);
  }
  &.error {
    background-color: var(--surface-error-color);
  }
  &.info {
    background-color: var(--surface-info-color);
  }
  &.size-sm {
    padding: 0.5rem 0.75rem;
    gap: 0.5rem;
    svg {
      width: 1.25em;
    }
  }
  svg {
    flex-shrink: 0;
  }
}
</style>
