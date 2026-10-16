<template>
  <ul class="days">
    <li
      v-for="day in WeekDays"
      :key="day"
      :class="{ day: true, 'is-closed': !schedule[day] }"
      :data-testid="`opening-hours-day-${day}`"
    >
      <strong class="day-name">{{ t(`days.${day}`) }}</strong>

      <div class="ranges">
        <span v-if="!schedule[day]" class="closed">
          {{ t("closed") }}
        </span>
        <div
          v-for="(range, index) in schedule[day]"
          :key="index"
          class="range-wrapper"
        >
          <div class="range">
            <Input
              v-model="range.from"
              type="time"
              :label="`${t(`days.${day}`)} ${t('from')}`"
              hide-label
              required
              :data-testid="`opening-hours-${day}-${index}-from`"
            />
            <span aria-hidden="true">–</span>
            <Input
              v-model="range.to"
              type="time"
              :label="`${t(`days.${day}`)} ${t('to')}`"
              hide-label
              required
              :data-testid="`opening-hours-${day}-${index}-to`"
            />
            <Button
              variant="secondary"
              size="sm"
              circle
              :title="t('remove_range')"
              :data-testid="`opening-hours-${day}-${index}-remove`"
              @click="removeRange(day, index)"
            >
              <Xmark />
            </Button>
          </div>
          <small v-if="isInvalid(range)" class="error">
            {{ t("invalid_range") }}
          </small>
        </div>
      </div>

      <Button
        variant="secondary"
        size="sm"
        class="add"
        :title="t('add_range')"
        :data-testid="`opening-hours-${day}-add`"
        @click="addRange(day)"
      >
        <Plus /> {{ t("add") }}
      </Button>
    </li>
  </ul>
</template>

<script setup lang="ts">
import {
  WeekDays,
  type OpeningHoursRange,
  type WeekDay,
  type WeeklySchedule,
} from "@@/lib/openingHours";
import Button from "@/components/core/Button.vue";
import Input from "@/components/core/Input.vue";
import { Plus, Xmark } from "@iconoir/vue";
import { DateTime } from "luxon";

const { t } = useI18n({ useScope: "local" });

const schedule = defineModel<WeeklySchedule>({ required: true });

function isInvalid(range: OpeningHoursRange) {
  return !!range.from && !!range.to && range.from >= range.to;
}

function addRange(day: WeekDay) {
  const ranges = schedule.value[day];
  const last = ranges?.at(-1);
  if (!ranges || !last) {
    // Opens the day
    schedule.value[day] = [{ from: "10:00", to: "18:00" }];
    return;
  }
  // Start the new range where the previous one ends, lasting one hour
  const from = DateTime.fromFormat(last.to, "HH:mm");
  const to = from.plus({ hours: 1 });
  ranges.push({
    from: last.to,
    to: to.hasSame(from, "day") ? to.toFormat("HH:mm") : "23:59",
  });
}

function removeRange(day: WeekDay, index: number) {
  const ranges = schedule.value[day];
  ranges?.splice(index, 1);
  if (ranges?.length === 0) {
    // Without ranges the day is closed
    delete schedule.value[day];
  }
}
</script>

<style scoped>
.days {
  list-style: none;
  margin: 0;
  padding: 0;
}
.day {
  display: grid;
  grid-template-columns: 7rem minmax(0, 1fr) auto;
  grid-template-areas: "name ranges add";
  align-items: start;
  column-gap: var(--spacing-4);
  row-gap: var(--spacing-2);
  padding-block: var(--spacing-3);
  border-bottom: 1px solid var(--input-border-color);
}
.day:first-child {
  padding-top: 0;
}
.day:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}
.day-name {
  grid-area: name;
}
.ranges {
  grid-area: ranges;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}
/* Align text and button with the center of the inputs */
.day-name,
.closed {
  line-height: 2.5rem;
}
.add {
  grid-area: add;
  margin-top: 0.4rem;
}
.closed {
  color: var(--text-color-light);
}
.range {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}
.range :deep(.root) {
  width: 7.5rem;
}
.error {
  display: block;
  margin-top: var(--spacing-1);
  color: #d55136;
}
@media (max-width: 600px) {
  .day {
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas:
      "name add"
      "ranges ranges";
  }
  .day.is-closed {
    grid-template-columns: auto minmax(0, 1fr) auto;
    grid-template-areas: "name ranges add";
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "days": {
      "monday": "Monday",
      "tuesday": "Tuesday",
      "wednesday": "Wednesday",
      "thursday": "Thursday",
      "friday": "Friday",
      "saturday": "Saturday",
      "sunday": "Sunday"
    },
    "closed": "Closed",
    "from": "from",
    "to": "to",
    "add": "Add",
    "invalid_range": "The end time should be later than the start time.",
    "add_range": "Add time range",
    "remove_range": "Remove time range"
  },
  "de": {
    "days": {
      "monday": "Montag",
      "tuesday": "Dienstag",
      "wednesday": "Mittwoch",
      "thursday": "Donnerstag",
      "friday": "Freitag",
      "saturday": "Samstag",
      "sunday": "Sonntag"
    },
    "closed": "Geschlossen",
    "from": "von",
    "to": "bis",
    "add": "Hinzufügen",
    "invalid_range": "Die Endzeit muss nach der Startzeit liegen.",
    "add_range": "Zeitraum hinzufügen",
    "remove_range": "Zeitraum entfernen"
  }
}
</i18n>
