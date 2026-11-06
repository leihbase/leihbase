<template>
  <TabHeader :title="t('future_title')">
    <template #suffix>
      <!-- Show cancelled switch -->
      <ShowCancelledSwitch id="show-cancelled-future" v-model="showCancelled" />
    </template>
  </TabHeader>
  <LoadingSpinner v-if="status === 'pending'" />
  <AdminReservationTable
    v-else-if="futureReservations && futureReservations.length > 0"
    :reservations="futureReservations"
    :location="location"
    highlight-date="start"
    @select="(reservation) => emit('select', reservation)"
  />
  <p v-else>
    <i>
      {{ t("no_future_reservations") }}
    </i>
  </p>
</template>

<script lang="ts" setup>
import type { Location } from "@@/models/location";
import type { Reservation } from "@@/models/reservation";
import AdminReservationTable from "@/components/admin/AdminReservationsTable.vue";
import LoadingSpinner from "@/components/core/LoadingSpinner.vue";
import ShowCancelledSwitch from "../ShowCancelledSwitch.vue";
import TabHeader from "../TabHeader.vue";

const { t } = useI18n({
  useScope: "local",
});

const props = defineProps<{
  location: Location;
}>();

const emit = defineEmits<{ select: [reservation: Reservation] }>();

const showCancelled = useShowCancelled();

const { data: futureReservations, status } = await useAdminReservations(
  props.location,
  "future"
);
</script>

<i18n lang="json">
{
  "en": {
    "no_future_reservations": "There are no future reservations.",
    "future_title": "Future reservations"
  },
  "de": {
    "no_future_reservations": "Es gibt keine zukünftige Reservierungen.",
    "future_title": "Anstehende Reservierungen"
  }
}
</i18n>
