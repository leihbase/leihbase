<template>
  <div class="step">
    <p>{{ t("intro", { location: location.name }) }}</p>
    <BorrowAgreementContent :borrow-agreement="borrowAgreement" />
  </div>
</template>

<script setup lang="ts">
import type { BorrowAgreement } from "~~/models/borrowAgreement.js";
import type { Location } from "~~/models/location.js";
import BorrowAgreementContent from "../BorrowAgreementContent.vue";

// Shown after the reservation has been made, when the borrow agreement of the
// location is optional. Accepting is the explicit action of the dialog's submit
// button, so there is no checkbox.
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
    "intro": "Your reservation has been placed. To borrow something at {location}, we ask you to read and accept the borrowing terms once. You can also do this later, or in the store at pickup:"
  },
  "de": {
    "intro": "Deine Reservierung wurde aufgegeben. Um bei {location} etwas zu leihen, bitten wir dich, einmalig die Leihbedingungen zu lesen und zu akzeptieren. Du kannst das auch später oder bei der Abholung vor Ort tun:"
  }
}
</i18n>
