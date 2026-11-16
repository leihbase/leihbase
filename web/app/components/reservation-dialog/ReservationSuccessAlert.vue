<template>
  <Alert variant="success" data-testid="reservation-success" class="alert">
    {{
      t("reserved", {
        product: product.name,
        start: formatDate(reservation.start, "DD.MM.YYYY", formatLocale),
        end: formatDate(reservation.end, "DD.MM.YYYY", formatLocale),
      })
    }}
  </Alert>
</template>

<script setup lang="ts">
import { formatDate } from "~~/lib/date.js";
import type { Product } from "~~/models/product.js";
import type { Reservation } from "~~/models/reservation.js";
import Alert from "../core/Alert.vue";

// Shows that the reservation of the product has been created
defineProps<{
  product: Product;
  reservation: Reservation;
}>();

const { t } = useI18n({ useScope: "local" });
const formatLocale = useFormatLocale();
</script>

<style scoped>
.alert {
  margin: 0;
}
</style>

<i18n lang="json">
{
  "en": {
    "reserved": "{product} has been reserved from {start} to {end}."
  },
  "de": {
    "reserved": "{product} ist vom {start} bis {end} erfolgreich reserviert."
  }
}
</i18n>
