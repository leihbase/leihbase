<template>
  <TabHeader :title="t('ongoing_title')">
    <template #suffix>
      <!-- Show cancelled switch -->
      <ShowCancelledSwitch
        id="show-cancelled-ongoing"
        v-model="showCancelled"
      />
    </template>
  </TabHeader>
  <LoadingSpinner v-if="status === 'pending'" />
  <AdminReservationTable
    v-else-if="ongoingReservations && ongoingReservations.length > 0"
    :reservations="ongoingReservations"
    :location="location"
    highlight-date="end"
    @select="(reservation) => emit('select', reservation)"
  />
  <p v-else>
    <i>
      {{ t("no_ongoing_reservations") }}
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

const { data: ongoingReservations, status } = await useAdminReservations(
  props.location,
  "ongoing"
);
</script>

<i18n lang="json">
{
  "en": {
    "no_ongoing_reservations": "There are no ongoing reservations.",
    "ongoing_title": "Ongoing reservations"
  },
  "de": {
    "no_ongoing_reservations": "Es gibt keine laufende Reservierungen.",
    "ongoing_title": "Laufende Reservierungen"
  }
}
</i18n>
