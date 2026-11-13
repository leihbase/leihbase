<template>
  <header>
    <div>
      <h1>
        <Heading is="span" size="lg">{{ location?.name }}</Heading>
        <Heading is="span" size="xl">{{ title }}</Heading>
      </h1>
    </div>
    <slot></slot>
  </header>
</template>

<script setup lang="ts">
import Heading from "@/components/core/Heading.vue";
import type { RecordModel } from "pocketbase";

defineProps<{ title: string; location: RecordModel }>();
</script>

<style lang="scss" scoped>
@use "@/assets/styles/breakpoints.scss";

header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--fluid-spacing-4);
  margin-bottom: var(--fluid-spacing-8);
  h1 {
    margin: 0;
  }
  span {
    display: block;
  }
}
@media screen and (min-width: breakpoints.$breakpoint-sm) {
  header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
