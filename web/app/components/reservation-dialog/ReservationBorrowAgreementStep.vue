<template>
  <div class="step">
    <p>{{ t("intro", { location: location.name }) }}</p>
    <Scrollable class="borrow-agreement">
      <div
        v-html="borrowAgreement.content"
        class="content"
        data-testid="borrow-agreement-content"
      ></div>
    </Scrollable>
    <Checkbox
      id="borrow-agreement-accept"
      v-model="accepted"
      data-testid="borrow-agreement-checkbox"
      required
    >
      {{ t("accept", { location: location.name }) }}
    </Checkbox>
  </div>
</template>

<script setup lang="ts">
import type { BorrowAgreement } from "~~/models/borrowAgreement.js";
import type { Location } from "~~/models/location.js";
import Checkbox from "../core/Checkbox.vue";
import Scrollable from "../core/Scrollable.vue";

defineProps<{
  location: Location;
  borrowAgreement: BorrowAgreement;
}>();

const accepted = defineModel<boolean>("accepted", { default: false });

const { t } = useI18n({ useScope: "local" });
</script>

<style lang="scss" scoped>
@use "@/assets/styles/breakpoints.scss";

.step {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.step p {
  margin: 0;
}
.borrow-agreement {
  // Grow its height on mobile to fill dialog
  flex: 1 1 0;

  min-height: 10rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--input-border-color);
  border-radius: var(--border-radius);
  background-color: var(--input-background-color);

  @media screen and (min-width: breakpoints.$breakpoint-sm) {
    flex: none;

    // Clamp between min and max height
    height: clamp(10rem, 100dvh - 26rem, 21.5rem);
  }
}
.content {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--text-color);
}
.content :deep(h3),
.content :deep(h4) {
  margin: 1.5rem 0 0.5rem;
  line-height: 1.15;
  font-weight: var(--font-weight-bold);
  color: var(--text-color);
}
.content :deep(h3) {
  font-size: 1.125rem;
}
.content :deep(h4) {
  font-size: 1rem;
}
.content :deep(p) {
  margin-bottom: 0.5rem;
}
.content :deep(ol),
.content :deep(ul) {
  padding-left: 1.5rem;
  margin-bottom: 0.5rem;
}
.content :deep(li[data-list="bullet"]) {
  list-style-type: disc;
}
.content :deep(li) {
  margin-bottom: 0.25rem;
}
.content :deep(> :first-child) {
  margin-top: 0;
}
</style>

<i18n lang="json">
{
  "en": {
    "intro": "To borrow something at {location}, we ask you to read and accept the borrowing terms once:",
    "accept": "I have read and accept the borrowing terms of {location}"
  },
  "de": {
    "intro": "Um bei {location} etwas zu leihen, bitten wir dich, einmalig die Leihbedingungen zu lesen und zu akzeptieren:",
    "accept": "Ich habe die Leihbedingungen von {location} gelesen und akzeptiere sie"
  }
}
</i18n>
