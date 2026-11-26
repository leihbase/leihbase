<template>
  <Button
    variant="secondary"
    :class="['card', 'status-' + getReservationStatus(reservation)]"
    @click="emit('click', $event)"
  >
    <img
      :src="`${config.public.pocketbase.clientBaseUrl}/api/files/products/${reservation.product}/${product.images[0]}${thumbs.sm}`"
    />
    <div class="details">
      <h2>{{ product?.name }}</h2>
      <p>
        {{ formatDate(reservation.start, "DD.MM.YYYY", locale) }}
        -
        {{ formatDate(reservation.end, "DD.MM.YYYY", locale) }}
      </p>
      <span class="tag">
        {{ t(getReservationStatus(reservation)) }}
      </span>
    </div>
  </Button>
</template>

<script setup lang="ts">
import { formatDate } from "@@/lib/date";
import { getReservationStatus } from "@@/lib/reservation";
import type { Product } from "@@/models/product";
import { type Reservation } from "@@/models/reservation";
import Button from "@/components/core/Button.vue";

const config = useRuntimeConfig();

const {
  product: { thumbs },
} = useAppConfig();

const { t, locale } = useI18n({
  useScope: "local",
});

defineProps<{ reservation: Reservation; product: Product }>();
const emit = defineEmits<{ click: [event: MouseEvent] }>();
</script>

<style scoped lang="scss">
.card {
  display: flex;
  padding: 0.5rem !important;
  gap: var(--fluid-spacing-4);
  text-align: left;
  width: 100%;
  align-items: stretch;
  h2 {
    font-weight: var(--font-weight-bold);
    font-size: 1rem;
    margin: 0;
  }
  img {
    width: 7rem;
    height: 7rem;
    object-fit: cover;
    border-radius: var(--border-radius);
    flex-shrink: 0;
  }
  .details {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  p {
    margin: 0;
  }
  .tag {
    border: 1px solid var(--text-color-light);
    color: var(--text-color);
    padding: 0.25rem 0.333rem;
    font-size: var(--font-size-sm);
    line-height: 1;
    border-radius: var(--border-radius);
    margin-top: auto;
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "new": "New",
    "cancelled": "Cancelled",
    "started": "Picked-up",
    "ended": "Returned",
    "overdue": "Overdue"
  },
  "de": {
    "new": "Neu",
    "cancelled": "Storniert",
    "started": "Abgehollt",
    "ended": "Zurückgebracht",
    "overdue": "Überfällig"
  }
}
</i18n>
