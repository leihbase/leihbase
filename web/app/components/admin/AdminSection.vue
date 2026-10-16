<template>
  <section class="section">
    <div v-if="title || description" class="intro">
      <Heading v-if="title" is="h2" size="sm">{{ title }}</Heading>
      <p v-if="description" class="description">{{ description }}</p>
    </div>
    <div class="content">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import Heading from "@/components/core/Heading.vue";

defineProps<{
  title?: string;
  description?: string;
}>();
</script>

<style scoped>
/**
 * A section of an admin page, with the title and description on the left and
 * the content on the right. Stacks on smaller screens.
 */
.section {
  display: grid;
  grid-template-areas: "intro content";
  grid-template-columns: minmax(0, 16rem) minmax(0, 1fr);
  column-gap: var(--fluid-spacing-12);
  row-gap: var(--spacing-4);
  padding-block: var(--fluid-spacing-8);
}
.section + .section {
  border-top: 1px solid var(--input-border-color);
}
@media (max-width: 768px) {
  .section {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: "intro" "content";
  }
}
.description {
  margin: var(--spacing-2) 0 0;
  font-size: var(--font-size-sm);
  color: var(--text-color-light);
}
.intro {
  grid-area: intro;
}
.content {
  grid-area: content;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  min-width: 0;
}
</style>
