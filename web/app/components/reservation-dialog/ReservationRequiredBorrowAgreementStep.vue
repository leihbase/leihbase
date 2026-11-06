<template>
  <div class="step">
    <p>{{ t("intro", { location: location.name }) }}</p>
    <BorrowAgreementContent :borrow-agreement="borrowAgreement" />
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
import BorrowAgreementContent from "../BorrowAgreementContent.vue";
import Checkbox from "../core/Checkbox.vue";

defineProps<{
  location: Location;
  borrowAgreement: BorrowAgreement;
}>();

const { t } = useI18n({ useScope: "local" });
</script>

<style scoped>
.step {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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
