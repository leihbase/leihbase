<template>
  <TabHeader>
    <template #prefix>
      <!-- Previous day button -->
      <button class="change-date-button" @click="moveDate(-1)">
        <ArrowLeft class="icon" />
      </button>
    </template>
    <div class="title-wrapper">
      <!-- Title & loading state -->
      <Heading is="h3" size="md">
        <LoadingSpinner v-if="status === 'pending'" size="sm" />
        <template v-else>
          {{
            isToday(date) ? t("Today") : formatDate(date, "ddd, DD.MM", locale)
          }}
        </template>
      </Heading>
    </div>
    <template #suffix>
      <!-- Next day button -->
      <button class="change-date-button" @click="moveDate(1)">
        <ArrowRight class="icon" />
      </button>
      <!-- Show cancelled switch -->
      <ShowCancelledSwitch id="show-cancelled" v-model="showCancelled" />
    </template>
  </TabHeader>

  <AdminReservationTable
    v-if="status !== 'pending' && reservations && reservations.length > 0"
    :reservations="reservations"
    :location="location"
    :date="date"
    highlight-date="date"
    :show-warning="(r) => new Date(r.end) < startOfUTCDate(date)"
    @select="(reservation) => emit('select', reservation)"
  />

  <p v-else-if="status !== 'pending'">
    <i>
      {{
        t("no_reservations_on_date", {
          date: isToday(date)
            ? t("today")
            : t("on") + " " + formatDate(date, "DD.MM.YYYY", locale),
        })
      }}.
    </i>
  </p>
</template>

<script lang="ts" setup>
import { formatDate, isToday, startOfUTCDate } from "@@/lib/date";
import type { Location } from "@@/models/location";
import type { Reservation } from "@@/models/reservation";
import AdminReservationTable from "@/components/admin/AdminReservationsTable.vue";
import Heading from "@/components/core/Heading.vue";
import LoadingSpinner from "@/components/core/LoadingSpinner.vue";
import { ArrowLeft, ArrowRight } from "@iconoir/vue";
import ShowCancelledSwitch from "../ShowCancelledSwitch.vue";
import TabHeader from "../TabHeader.vue";

const { t, locale } = useI18n({
  useScope: "local",
});

const props = defineProps<{
  location: Location;
}>();

const emit = defineEmits<{ select: [reservation: Reservation] }>();

const date = ref(new Date(Date.now()));
const showCancelled = useShowCancelled();

const { data: reservations, status } = await useAdminReservations(
  props.location,
  "today",
  date
);

/**
 * Moves the date by the given number of days, which reloads the reservations
 */
function moveDate(days: number) {
  const newDate = new Date(date.value);
  newDate.setDate(newDate.getDate() + days);
  date.value = newDate;
}
</script>

<style lang="scss" scoped>
.title-wrapper {
  min-width: 10rem;
  display: flex;
  justify-content: center;
  align-items: center;
}
h3 {
  text-align: center;
  margin: 0;
}
.change-date-button {
  background-color: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
  .icon {
    width: 1em;
    height: 1em;
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "today": "today",
    "Today": "Today",
    "no_reservations_on_date": "No reservations starting or ending {date}",
    "on": "at"
  },
  "de": {
    "today": "heute",
    "Today": "Heute",
    "no_reservations_on_date": "Es gibt keine Reservierungen, die {date} starten oder enden",
    "on": "am"
  }
}
</i18n>
