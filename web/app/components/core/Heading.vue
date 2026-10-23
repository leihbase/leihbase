<template>
  <component :is="is" :class="`heading size-${size} ${cap ? 'cap' : ''}`">
    <slot />
  </component>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from "vue";

/**
 * Native attributes (e.g. `id`, `data-testid`) which fall through to the root
 * element. Only used for type checking, see `@vue-ignore`.
 */
interface NativeAttributes extends HTMLAttributes {
  // data-* attributes, camelized by Vue
  [dataAttribute: `data${Capitalize<string>}`]: unknown;
}

interface Props extends /* @vue-ignore */ NativeAttributes {
  is: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span";
  size: "sm" | "md" | "lg" | "xl";
  cap?: boolean;
}

defineProps<Props>();
</script>

<style scoped>
.heading {
  margin: 0;
  line-height: 1.15;
  color: var(--text-color);
}
.cap:before {
  content: "";
  margin-bottom: -0.2em;
  display: table;
}
.cap:after {
  content: "";
  margin-bottom: 0em;
  display: table;
}
.size-xl {
  font-size: 2rem;
  font-weight: var(--font-weight-black);
}
.size-lg {
  font-size: 1.5rem;
  font-weight: var(--font-weight-bold);
}
.size-md {
  font-size: 1.25rem;
  font-weight: var(--font-weight-bold);
}
.size-sm {
  font-size: 1.125rem;
  font-weight: var(--font-weight-bold);
}
</style>
