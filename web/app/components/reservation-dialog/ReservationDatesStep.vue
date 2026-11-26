<template>
  <div class="step">
    <!-- Opening hours -->
    <p
      v-if="location.opening_hours"
      class="opening-hours"
      data-testid="opening-hours"
    >
      <span>{{ t("opening_hours_of") }} {{ location.name }}:</span>
      <br />
      <span
        v-html="openingHoursToString(location.opening_hours, locale)"
      ></span>
    </p>
    <Input
      type="text"
      :label="t('product')"
      :model-value="product.name"
      required
      disabled
      readonly
    />
    <DateInput
      :label="t('start')"
      :key="`start-date-${location.id}`"
      v-model="start"
      :is-date-disallowed="isStartDateDisallowed"
      :show-outside-days="false"
      :description="startDateDescription"
      data-testid="start-input"
      required
    />
    <DateInput
      :label="t('end')"
      :key="`end-date-${location.id}`"
      :popout-key="`end-date-popout-${start?.getTime()}`"
      v-model="end"
      :is-date-disallowed="isEndDateDisallowed"
      :show-outside-days="false"
      :description="endDateDescription"
      data-testid="end-input"
      required
    />
    <Textarea :label="t('message')" v-model="message" />
  </div>
</template>

<script setup lang="ts">
import { isInOpeningHoursDay } from "@@/lib/openingHours";
import type { OpeningHours } from "@@/lib/openingHours";
import {
  addDays,
  startOfDate as getStartOfDate,
  getStartOfDay,
  isSameDate,
} from "~~/lib/date.js";
import { openingHoursToString } from "~~/lib/openingHours.js";
import type { Location } from "~~/models/location.js";
import type { Product } from "~~/models/product.js";
import DateInput from "../core/DateInput.vue";
import Input from "../core/Input.vue";
import Textarea from "../core/Textarea.vue";

const props = defineProps<{
  location: Location;
  product: Product;
}>();

const start = defineModel<Date>("start");
const end = defineModel<Date>("end");
const message = defineModel<string>("message");

const { t, locale } = useI18n({ useScope: "local" });

const startOfToday = getStartOfDay();
const closedDates = computed(() =>
  (props.location.opening_hours?.except?.dates || []).map((d) =>
    getStartOfDate(new Date(d))
  )
);
const maxReservationDays = computed(
  () => props.location.max_reservation_days || 0
);
const reservationStartLimit = computed(
  () => props.location.reservation_start_limit || 0
);

const startDateDescription = computed(() => {
  if (reservationStartLimit.value <= 0) {
    return undefined;
  }
  return `${props.location.name} ${t("allows_reserving_days_in_future", { days: reservationStartLimit.value })}`;
});

const endDateDescription = computed(() => {
  if (maxReservationDays.value <= 0) {
    return undefined;
  }
  return `${props.location.name} ${t("allows_reservations_up_to_days", { days: maxReservationDays.value })}`;
});

function isPastDate(startOfDate: Date, today: Date) {
  return startOfDate < today;
}

function isClosedDate(startOfDate: Date, closedDatesList: Date[]) {
  return closedDatesList.some((date) => isSameDate(date, startOfDate));
}

function isBeyondStartLimit(startOfDate: Date, limit: number, today: Date) {
  if (limit <= 0) return false;
  const limitDate = addDays(today, limit);
  return startOfDate > limitDate;
}

function isBeyondMaxDuration(
  date: Date,
  startDate: Date | undefined,
  limit: number
) {
  if (limit <= 0 || !startDate) return false;
  const maxEndDate = addDays(getStartOfDate(startDate), limit);
  return date > maxEndDate;
}

function isOpenDay(date: Date, openingHours: OpeningHours | undefined) {
  return openingHours ? isInOpeningHoursDay(openingHours, date) : true;
}

function isStartDateDisallowed(date: Date): boolean {
  const startOfDate = getStartOfDate(date);
  const isOpen = isOpenDay(date, props.location.opening_hours);
  const isPast = isPastDate(startOfDate, startOfToday);
  const isClosed = isClosedDate(startOfDate, closedDates.value);
  const isBeyondLimit = isBeyondStartLimit(
    startOfDate,
    reservationStartLimit.value,
    startOfToday
  );
  return !isOpen || isPast || isClosed || isBeyondLimit;
}

function isEndDateDisallowed(date: Date): boolean {
  const startOfDate = getStartOfDate(date);
  const isBeforeStart =
    start.value && startOfDate <= getStartOfDate(start.value);
  const isOpen = isOpenDay(date, props.location.opening_hours);
  const isPast = isPastDate(startOfDate, startOfToday);
  const isClosed = isClosedDate(startOfDate, closedDates.value);
  const isBeyondMax = isBeyondMaxDuration(
    startOfDate,
    start.value,
    maxReservationDays.value
  );
  return !isOpen || isPast || isBeforeStart || isClosed || isBeyondMax;
}
</script>

<style scoped>
.step {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.opening-hours {
  padding: 1rem;
  font-size: 0.9375rem;
  line-height: 1.6;
  background-color: #ecf4fe;
  border-radius: var(--border-radius);
  margin: 0;
}
</style>

<i18n lang="json">
{
  "en": {
    "opening_hours_of": "Opening hours of",
    "product": "Product",
    "start": "Start",
    "end": "End",
    "message": "Message",
    "allows_reserving_days_in_future": "allows reserving {days} days in the future.",
    "allows_reservations_up_to_days": "allows reservations up to {days} days."
  },
  "de": {
    "opening_hours_of": "Öffnungszeiten von",
    "product": "Gegenstand",
    "start": "Start",
    "end": "Ende",
    "message": "Nachricht",
    "allows_reserving_days_in_future": "erlaubt Reservierungen bis zu {days} Tage im Voraus.",
    "allows_reservations_up_to_days": "erlaubt Reservierungen von bis zu {days} Tagen."
  }
}
</i18n>
