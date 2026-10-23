<template>
  <TabHeader>
    <template #prefix>
      <!-- Previous day button -->
      <button class="change-date-button" @click="handleDayBackward">
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
      <button class="change-date-button" @click="handleDayForward">
        <ArrowRight class="icon" />
      </button>
      <!-- Show cancelled switch -->
      <ShowCancelledSwitch
        id="show-cancelled"
        v-model="showCancelled"
        @update:model-value="refresh()"
      />
    </template>
  </TabHeader>

  <AdminReservationTable
    v-if="status !== 'pending' && reservations && reservations.length > 0"
    :reservations="reservations"
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
import { endOfUTCDate, formatDate, isToday, startOfUTCDate } from "@@/lib/date";
import type { Reservation } from "@@/models/reservation";
import AdminReservationTable from "@/components/admin/AdminReservationsTable.vue";
import Heading from "@/components/core/Heading.vue";
import LoadingSpinner from "@/components/core/LoadingSpinner.vue";
import { ArrowLeft, ArrowRight } from "@iconoir/vue";
import type { EventHookOn } from "@vueuse/core";
import type { RecordModel } from "pocketbase";
import ShowCancelledSwitch from "../ShowCancelledSwitch.vue";
import TabHeader from "../TabHeader.vue";

const { pb } = usePocketbase();
const { t, locale } = useI18n({
  useScope: "local",
});

const props = defineProps<{
  location: RecordModel;
  reservationUpdateHook: EventHookOn;
}>();

const emit = defineEmits<{ select: [reservation: Reservation] }>();

props.reservationUpdateHook(() => {
  refresh();
});

const date = ref(new Date(Date.now()));
const showCancelled = useShowCancelled();

const {
  data: reservations,
  refresh,
  status,
} = await useAsyncData<Reservation[]>(
  "admin_todays_reservations",
  () =>
    pb.collection("reservations").getFullList({
      filter: pb.filter(
        `location = {:location} ${showCancelled.value ? "" : "&& cancelled = false"} && ((start >= {:dateStart} && start <= {:dateEnd}) || (end >= {:dateStart} && end <= {:dateEnd}))`,
        {
          location: props.location.id,
          dateStart: startOfUTCDate(date.value),
          dateEnd: endOfUTCDate(date.value),
        }
      ),
      sort: "start",
      expand: "product,user",
      requestKey: "admin_todays_reservations",
    }),
  { lazy: true }
);

function handleDayBackward() {
  date.value.setDate(date.value.getDate() - 1);
  refresh();
}

function handleDayForward() {
  date.value.setDate(date.value.getDate() + 1);
  refresh();
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
