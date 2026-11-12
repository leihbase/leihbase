<template>
  <TabHeader :title="t('past_title')">
    <template #suffix>
      <!-- Show cancelled switch -->
      <ShowCancelledSwitch id="show-cancelled-past" v-model="showCancelled" />
    </template>
  </TabHeader>
  <LoadingSpinner v-if="status === 'pending'" />
  <AdminReservationTable
    v-else-if="pastReservations && pastReservations.length > 0"
    :reservations="pastReservations"
    :location="location"
    highlight-date="both"
    @select="(reservation) => emit('select', reservation)"
  />
  <p v-else>
    <i>
      {{ t("no_past_reservations") }}
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

const { data: pastReservations, status } = await useAdminReservations(
  props.location,
  "past"
);
</script>

<i18n lang="json">
{
  "en": {
    "past_title": "Past Reservations (last 100)",
    "no_past_reservations": "No past reservations"
  },
  "de": {
    "past_title": "Vergangene Reservierungen (letzte 100)",
    "no_past_reservations": "Keine vergangene Reservierungen"
  }
}
</i18n>
