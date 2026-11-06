<template>
  <div
    v-html="borrowAgreement.content"
    class="borrow-agreement rich-text"
    data-testid="borrow-agreement-content"
  ></div>
</template>

<script setup lang="ts">
import type { BorrowAgreement } from "~~/models/borrowAgreement.js";

defineProps<{
  borrowAgreement: BorrowAgreement;
}>();
</script>

<style lang="scss" scoped>
@use "@/assets/styles/breakpoints.scss";

.borrow-agreement {
  // Grow its height on mobile to fill a (flex column) parent
  flex: 1 1 0;

  min-height: 10rem;
  overflow-y: auto;
  padding: 1rem 1.25rem;
  border: 1px solid var(--input-border-color);
  border-radius: var(--border-radius);
  background-color: var(--input-background-color);
  font-size: 0.9375rem;
  line-height: 1.6;

  @media screen and (min-width: breakpoints.$breakpoint-sm) {
    flex: none;

    // Clamp between min and max height
    height: clamp(10rem, 100dvh - 26rem, 21.5rem);
  }
}
</style>
