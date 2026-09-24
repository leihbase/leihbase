<template>
  <section
    :class="{
      centered: props.centered,
      'no-padding': props.noPadding,
      'padding-x': props.paddingX,
      'padding-y': props.paddingY,
      ['width-' + props.width]: !!props.width,
    }"
  >
    <slot></slot>
  </section>
</template>

<script lang="ts" setup>
const props = defineProps<{
  width: "sm" | "md" | "lg";
  centered?: boolean;
  noPadding?: boolean;
  paddingX?: boolean;
  paddingY?: boolean;
}>();
</script>

<style scoped>
section:not(.no-padding) {
  padding: var(--fluid-spacing-6);
}
section.padding-y {
  padding: var(--fluid-spacing-6) 0;
}
section.padding-x {
  padding: 0 var(--fluid-spacing-6);
}
section.width-xl {
  max-width: 1400px;
}
section.width-lg {
  max-width: 1200px;
}
section.width-md {
  max-width: 900px;
}
section.width-sm {
  max-width: var(--fluid-container-sm);
}
section.centered {
  margin: 0 auto;
}
</style>
