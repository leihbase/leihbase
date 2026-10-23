<template>
  <Dialog inset title="Reservierung" v-model:open="open" @close="emit('close')">
    <div v-if="reservation && product && location" class="product">
      <img
        :src="`${config.public.pocketbase.clientBaseUrl}/api/files/products/${product.id}/${product.images[0]}${thumbs.sm}`"
      />
      <div>
        <p>
          <strong>{{ t("product") }}</strong>
          <br />
          <a :href="`/link/product/${product.id}`" target="_blank">
            {{ product.name }}
          </a>
        </p>
        <p>
          <strong>{{ t("location") }}</strong>
          <br />
          <a :href="`/l/${location.slug}`" target="_blank">
            {{ location.name }}
          </a>
        </p>
        <p>
          <strong>{{ t("borrow_period") }}</strong>
          <br />
          {{ formatDate(reservation.start, "DD.MM.YYYY", locale) }}
          -
          {{ formatDate(reservation.end, "DD.MM.YYYY", locale) }}
        </p>
        <p
          v-if="
            status !== ReservationStatus.New &&
            status !== ReservationStatus.Cancelled
          "
        >
          <strong>{{ t("deposit") }}</strong>
          <br />
          {{ formatCurrency(reservation.deposit, locale) }}
        </p>
      </div>
    </div>

    <Accordion v-if="reservation" :single="true" class="accordion">
      <AccordionItem id="reservation-dialog-cancel">
        <AccordionTrigger
          :disabled="
            status === ReservationStatus.Ended ||
            status === ReservationStatus.Overdue ||
            status === ReservationStatus.Cancelled
          "
        >
          {{ t("cancel_trigger") }}
        </AccordionTrigger>
        <AccordionContent>
          <div v-if="status === ReservationStatus.New">
            <p>{{ t("cancel_text") }}</p>
            <Button
              v-if="
                cancellationStatus === ReservationCancellationStatus.Default ||
                cancellationStatus === ReservationCancellationStatus.Loading
              "
              :loading="
                cancellationStatus === ReservationCancellationStatus.Loading
              "
              @click="cancel"
            >
              {{ t("cancel_button") }}
            </Button>
            <Alert
              v-else-if="
                cancellationStatus === ReservationCancellationStatus.Success
              "
              variant="success"
            >
              {{ cancellationMessage }}
            </Alert>
            <Alert
              v-else-if="
                cancellationStatus === ReservationCancellationStatus.Error
              "
              variant="error"
            >
              {{ cancellationMessage }}
            </Alert>
          </div>
          <div v-else-if="status === ReservationStatus.Started">
            <p>
              {{ t("cancel_not_possible_text", [location?.email]) }}
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem id="reservation-dialog-change-period">
        <AccordionTrigger
          :disabled="
            status === ReservationStatus.Ended ||
            status === ReservationStatus.Overdue ||
            status === ReservationStatus.Cancelled
          "
          >{{ t("change_period_trigger") }}</AccordionTrigger
        >
        <AccordionContent>
          <p>{{ t("change_period_text", [location?.email]) }}</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </Dialog>
</template>

<script setup lang="ts">
import { formatCurrency } from "@@/lib/currency";
import { formatDate } from "@@/lib/date";
import { getReservationStatus } from "@@/lib/reservation";
import type { Location } from "@@/models/location";
import type { Product } from "@@/models/product";
import { ReservationStatus, type Reservation } from "@@/models/reservation";
import Accordion from "@/components/core/accordion/Accordion.vue";
import AccordionContent from "@/components/core/accordion/AccordionContent.vue";
import AccordionItem from "@/components/core/accordion/AccordionItem.vue";
import AccordionTrigger from "@/components/core/accordion/AccordionTrigger.vue";
import Alert from "@/components/core/Alert.vue";
import Button from "@/components/core/Button.vue";
import Dialog from "@/components/core/Dialog.vue";
import {
  ReservationCancellationStatus,
  useReservationCancellation,
} from "@/composables/useReservationCancellation";

const config = useRuntimeConfig();
const {
  product: { thumbs },
} = useAppConfig();

const { t, locale } = useI18n({
  useScope: "local",
});

const props = defineProps<{
  reservation?: Reservation;
  product?: Product;
  location?: Location;
}>();

const emit = defineEmits<{ update: []; close: [] }>();

const open = ref<boolean>(false);
watch(
  () => props.reservation,
  (newValue) => {
    open.value = !!newValue;
  }
);

const status = computed<ReservationStatus | null>(() => {
  if (props.reservation) {
    return getReservationStatus(props.reservation);
  }
  return null;
});

const {
  cancel,
  status: cancellationStatus,
  message: cancellationMessage,
} = useReservationCancellation(
  () => props.reservation,
  () => props.location,
  () => emit("update")
);
</script>

<style lang="scss" scoped>
.product {
  display: flex;
  align-items: flex-start;
  background-color: var(--background-color);
  padding: var(--fluid-spacing-4);
  gap: var(--fluid-spacing-4);
  border-radius: var(--border-radius);
  margin-bottom: var(--fluid-spacing-4);
  img {
    width: 33.33%;
    aspect-ratio: 1/1;
    border-radius: var(--border-radius);
    object-fit: cover;
  }
  p:last-child {
    margin: 0;
  }
}
.accordion p:not(:last-child) {
  margin-bottom: 1rem;
}
</style>

<i18n lang="json">
{
  "en": {
    "product": "Product",
    "location": "Location",
    "borrow_period": "Borrow period",
    "deposit": "Deposit",
    "cancel_trigger": "Cancel reservation",
    "cancel_text": "Do you no longer wish to borrow the item?? Make the item available again by cancelling your reservation. Please note that this action cannot be undone.",
    "cancel_button": "Cancel reservation",
    "cancel_not_possible_text": "This reservation can't be cancelled as it already started, please send an e-mail to {0} for any questions or remarks.",
    "change_period_trigger": "Update reservation period",
    "change_period_text": "To update the reservation period, please send an e-mail to {0}."
  },
  "de": {
    "product": "Gegenstand",
    "location": "Standort",
    "borrow_period": "Leihfrist",
    "deposit": "Pfand",
    "cancel_trigger": "Reservierung stornieren",
    "cancel_text": "Möchtest du den Gegenstand nicht mehr ausleihen? Mache den Gegenstand duch die Stornierung deiner Reservierung wieder verfügbar. Bitte beachte dass diese Aktion nicht rückgängig gemacht werden kann.",
    "cancel_button": "Reservierung stornieren",
    "cancel_not_possible_text": "Diese Reservierung kann nicht storniert worden, da sie bereits begonnen hat. Bei Fragen oder Problemen schicke uns bitte eine E-Mail an {0}.",
    "change_period_trigger": "Leihfrist änderen",
    "change_period_text": "Um deine Leihfrist zu änderen, schicke bitte eine E-Mail an {0}."
  }
}
</i18n>
