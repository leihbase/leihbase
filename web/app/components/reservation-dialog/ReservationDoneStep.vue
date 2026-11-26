<template>
  <div class="done" data-testid="reservation-success">
    <span class="icon" aria-hidden="true"><Check /></span>
    <Heading is="h3" size="md">
      {{ t("reserved", { product: product.name }) }}
    </Heading>
    <p class="dates">
      {{ formatDate(reservation.start, "dd, D MMM YYYY", locale) }}
      –
      {{ formatDate(reservation.end, "dd, D MMM YYYY", locale) }}
    </p>
    <i18n-t keypath="overview" tag="p" class="overview">
      <NuxtLink
        to="/reservations"
        data-testid="reservation-overview-link"
        @click="emit('close')"
      >
        {{ t("overview_link") }}
      </NuxtLink>
    </i18n-t>
    <Button
      variant="secondary"
      data-testid="reservation-close"
      @click="emit('close')"
    >
      {{ t("close_button") }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import { Check } from "@iconoir/vue";
import { formatDate } from "~~/lib/date.js";
import type { Product } from "~~/models/product.js";
import type { Reservation } from "~~/models/reservation.js";
import Button from "../core/Button.vue";
import Heading from "../core/Heading.vue";

// Last step of the dialog, confirming the reservation
defineProps<{
  product: Product;
  reservation: Reservation;
}>();
const emit = defineEmits<{ close: [] }>();

const { t, locale } = useI18n({ useScope: "local" });
</script>

<style lang="scss" scoped>
// Centered, also vertically in the full screen dialog on mobile
.done {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 0 0.5rem;
  text-align: center;
}
.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  margin-bottom: 0.25rem;
  border-radius: 50%;
  background-color: var(--surface-success-color);
  svg {
    width: 1.75rem;
    height: 1.75rem;
    stroke-width: 2;
  }
}
.dates,
.overview {
  margin: 0;
}
.overview {
  margin-bottom: 0.75rem;
}
</style>

<i18n lang="json">
{
  "en": {
    "reserved": "{product} is reserved",
    "overview": "You can also find it in your {0}.",
    "overview_link": "reservations",
    "close_button": "Close"
  },
  "de": {
    "reserved": "{product} ist reserviert",
    "overview": "Du findest sie auch in deinen {0}.",
    "overview_link": "Reservierungen",
    "close_button": "Schließen"
  }
}
</i18n>
