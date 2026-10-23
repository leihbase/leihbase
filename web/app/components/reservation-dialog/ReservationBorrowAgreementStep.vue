<template>
  <div class="step">
    <p>{{ t("intro", { location: location.name }) }}</p>
    <div
      v-html="borrowAgreement.content"
      class="borrow-agreement rich-text"
      data-testid="borrow-agreement-content"
    ></div>
    <Checkbox
      id="borrow-agreement-accept"
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

defineProps<{
  location: Location;
  borrowAgreement: BorrowAgreement;
}>();

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
.borrow-agreement {
  // Grow its height on mobile to fill dialog
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
