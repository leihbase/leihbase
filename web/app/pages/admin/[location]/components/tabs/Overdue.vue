<template>
  <TabHeader :title="t('title')" />
  <LoadingSpinner v-if="status === 'pending'" />
  <AdminReservationTable
    v-else-if="reservations && reservations.length > 0"
    :reservations="reservations"
    highlight-date="overdue"
    :show-warning="() => true"
    @select="(reservation) => emit('select', reservation)"
  />
  <p v-else>
    <i>
      {{ t("no_reservations") }}
    </i>
  </p>
</template>

<script lang="ts" setup>
import type { Location } from "@@/models/location";
import type { Reservation } from "@@/models/reservation";
import AdminReservationTable from "@/components/admin/AdminReservationsTable.vue";
import LoadingSpinner from "@/components/core/LoadingSpinner.vue";
import TabHeader from "../TabHeader.vue";

const { t } = useI18n({
  useScope: "local",
});

const props = defineProps<{
  location: Location;
}>();

const emit = defineEmits<{ select: [reservation: Reservation] }>();

const { data: reservations, status } = await useAdminReservations(
  props.location,
  "overdue"
);
</script>

<i18n lang="json">
{
  "en": {
    "title": "Overdue reservations",
    "no_reservations": "No overdue reservations..."
  },
  "de": {
    "title": "Überfälligen Reservierungen",
    "no_reservations": "Keine überfälligen Reservierungen..."
  }
}
</i18n>
