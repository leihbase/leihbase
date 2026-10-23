<template>
  <Container width="lg" centered>
    <PageAlert class="banner" />

    <AdminNav v-if="location" :location="location" />
    <AdminHeader v-if="location" :title="t('title')" :location="location" />

    <form v-if="location" method="POST" @submit.prevent="handleSubmit">
      <Alert v-if="!savedOpeningHours" variant="info">
        {{ t("no_opening_hours") }}
      </Alert>

      <!-- Week schedule -->
      <AdminSection
        :title="t('weekly_schedule')"
        :description="t('weekly_schedule_description')"
      >
        <WeeklyScheduleInput v-model="days" />
      </AdminSection>

      <!-- Closed dates -->
      <AdminSection
        :title="t('closed_dates')"
        :description="t('closed_dates_description')"
      >
        <ul v-if="closedDates.length > 0" class="closed-dates">
          <li v-for="date in closedDates" :key="date">
            <Chip
              :remove-label="t('remove_date')"
              @remove="removeClosedDate(date)"
            >
              {{ formatDate(date, "dd, D MMM YYYY", locale) }}
            </Chip>
          </li>
        </ul>
        <p v-else class="muted">{{ t("no_closed_dates") }}</p>

        <div class="add-closed-date">
          <DateInput
            v-model="newClosedDate"
            :label="t('add_closed_date')"
            :placeholder="t('select_date')"
            :is-date-disallowed="(date: Date) => toShortISO(date) < today"
            data-testid="opening-hours-closed-date"
            hide-label
          />
          <Button
            variant="secondary"
            :disabled="!newClosedDate"
            data-testid="opening-hours-closed-date-add"
            @click="addClosedDate"
          >
            {{ t("add_closed_date") }}
          </Button>
        </div>

        <!-- Reservations on closed dates alert -->
        <Alert
          v-if="affectedReservations.length > 0"
          variant="warning"
          data-testid="opening-hours-warning"
        >
          <div>
            <p>{{ t("warning") }}</p>
            <ul class="affected">
              <li v-for="item in affectedReservations" :key="item.key">
                {{ formatDate(item.date, "dd, D MMM YYYY", locale) }}:
                {{ t(item.type) }}
                {{ item.reservation.expand?.product?.name }}
                <template v-if="item.reservation.expand?.user?.name">
                  ({{ item.reservation.expand.user.name }})
                </template>
              </li>
            </ul>
          </div>
        </Alert>
      </AdminSection>

      <!-- Preview -->
      <AdminSection
        :title="t('preview')"
        :description="t('preview_description')"
      >
        <p
          v-if="Object.keys(openingHours.days).length > 0"
          class="preview"
          data-testid="opening-hours-preview"
          v-html="openingHoursToString(openingHours, locale)"
        ></p>
        <p v-else class="preview muted">{{ t("always_closed") }}</p>
      </AdminSection>

      <AdminSection>
        <Alert v-if="errorMessage" variant="error">
          {{ errorMessage }}
        </Alert>
        <Alert v-if="success" variant="success">
          {{ t("success") }}
        </Alert>
        <div>
          <Button
            type="submit"
            :loading="loading"
            :disabled="hasInvalidRanges"
            data-testid="opening-hours-save"
          >
            {{ t("save") }}
          </Button>
        </div>
      </AdminSection>
    </form>
  </Container>
</template>

<script setup lang="ts">
import { formatDate, toShortISO } from "@@/lib/date";
import {
  isOpenOnDate,
  openingHoursToString,
  WeekDays,
  type OpeningHours,
  type WeeklySchedule,
} from "@@/lib/openingHours";
import type { Reservation } from "@@/models/reservation";
import AdminSection from "@/components/admin/AdminSection.vue";
import Alert from "@/components/core/Alert.vue";
import Button from "@/components/core/Button.vue";
import Chip from "@/components/core/Chip.vue";
import Container from "@/components/core/Container.vue";
import DateInput from "@/components/core/DateInput.vue";
import PageAlert from "@/components/page-alert/PageAlert.vue";
import { DateTime } from "luxon";
import AdminHeader from "./components/AdminHeader.vue";
import AdminNav from "./components/AdminNav.vue";
import WeeklyScheduleInput from "./components/WeeklyScheduleInput.vue";

const { t, locale } = useI18n({ useScope: "local" });
const route = useRoute();
const { pb } = usePocketbase();
const { loading, update, errors } = usePocketbaseUpdate(pb, "location");

const slug = route.params.location as string;
const success = ref(false);
const today = DateTime.now().toISODate()!;

const location = await useLocation({
  slug,
});

if (!location.value || !location.value.id) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page Not Found",
  });
}

useHead({
  title: `${t("title")} | ${location.value.name}`,
});

// Opening hours as currently saved
const savedOpeningHours = ref<OpeningHours | null>(
  location.value.opening_hours || null
);
// Copy, so that edits don't change the cached location record
const days = ref<WeeklySchedule>(
  structuredClone(toRaw(savedOpeningHours.value?.days || {}))
);
// Closed dates copy (except.dates)
const closedDates = ref<string[]>(
  [...(savedOpeningHours.value?.except?.dates || [])]
    .filter((date) => date >= today)
    .sort()
);
const newClosedDate = ref<Date | undefined>();

// The new opening hours, to be saved
const openingHours = computed<OpeningHours>(() => ({
  days: Object.fromEntries(
    // Keep the days in week order, also when added later
    WeekDays.filter((day) => days.value[day]).map((day) => [
      day,
      [...days.value[day]!].sort((a, b) => a.from.localeCompare(b.from)),
    ])
  ),
  except: { dates: closedDates.value },
}));

const hasInvalidRanges = computed(() =>
  Object.values(days.value)
    .flat()
    .some((range) => !range.from || !range.to || range.from >= range.to)
);

function addClosedDate() {
  if (!newClosedDate.value) return;
  const value = toShortISO(newClosedDate.value);
  if (!closedDates.value.includes(value)) {
    closedDates.value = [...closedDates.value, value].sort();
  }
  newClosedDate.value = undefined;
}

function removeClosedDate(date: string) {
  closedDates.value = closedDates.value.filter((d) => d !== date);
}

// Upcoming reservations, to warn about pickups and returns on closed days
const { data: reservations } = await useAsyncData<Reservation[]>(
  "admin_opening_hours_reservations",
  () =>
    pb.collection("reservations").getFullList({
      filter: pb.filter(
        "location = {:location} && cancelled = false && ended = false && end >= @todayStart",
        { location: location.value!.id }
      ),
      sort: "start",
      expand: "product,user",
      requestKey: "admin_opening_hours_reservations",
    }),
  { lazy: true }
);

const affectedReservations = computed(() =>
  (reservations.value || []).flatMap((reservation) => {
    const items: {
      key: string;
      type: "pickup" | "return";
      date: string;
      reservation: Reservation;
    }[] = [];
    const checks = [
      {
        type: "pickup" as const,
        date: reservation.start,
        skip: reservation.started,
      },
      { type: "return" as const, date: reservation.end, skip: false },
    ];
    for (const { type, date, skip } of checks) {
      const day = new Date(date).toISOString().slice(0, 10);
      if (!skip && day >= today && !isOpenOnDate(openingHours.value, day)) {
        items.push({
          key: `${reservation.id}-${type}`,
          type,
          date: day,
          reservation,
        });
      }
    }
    return items;
  })
);

const errorMessage = computed(() => {
  if (errors.fields["opening_hours"]) return t("invalid_opening_hours");
  if (errors.general) return t("error");
  return "";
});

async function handleSubmit() {
  success.value = false;
  try {
    const updated = await update(location.value!.id, {
      opening_hours: openingHours.value,
    });
    savedOpeningHours.value = updated.opening_hours;
    location.value = updated;
    success.value = true;
  } catch {
    // Errors are shown through `errors`, set by `update`
  }
}
</script>

<style scoped>
.muted {
  margin: 0;
  color: var(--text-color-light);
}
.closed-dates {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  margin: 0;
  padding: 0;
  list-style: none;
}
.add-closed-date {
  display: flex;
  gap: var(--spacing-2);
  max-width: 28rem;
}
.add-closed-date > :deep(.root) {
  flex: 1;
}
.preview {
  margin: 0;
  padding: var(--spacing-3) var(--spacing-4);
  border-left: 3px solid var(--input-border-color);
}
.affected {
  margin: var(--spacing-2) 0 0;
  padding-left: 1.25rem;
}
</style>

<i18n lang="json">
{
  "en": {
    "title": "Opening hours",
    "no_opening_hours": "No opening hours are set yet, so reservations are possible on every day until you save.",
    "weekly_schedule": "Weekly schedule",
    "weekly_schedule_description": "When items can be picked up and returned.",
    "closed_dates": "Closed dates",
    "closed_dates_description": "Exceptions such as holidays. Past dates are removed when saving.",
    "no_closed_dates": "No upcoming closed dates.",
    "add_closed_date": "Add closed date",
    "remove_date": "Remove date",
    "select_date": "Select a date",
    "preview": "Preview",
    "preview_description": "How visitors see the opening hours.",
    "always_closed": "No opening hours, the location is always closed.",
    "warning": "These reservations have a pickup or return on a closed day. Saving won't change them, you might want to contact the borrowers.",
    "pickup": "Pickup of",
    "return": "Return of",
    "invalid_opening_hours": "The opening hours are invalid, please check the time ranges.",
    "error": "Something went wrong while saving the opening hours.",
    "success": "Opening hours saved.",
    "save": "Save"
  },
  "de": {
    "title": "Öffnungszeiten",
    "no_opening_hours": "Es sind noch keine Öffnungszeiten eingerichtet, daher sind Reservierungen bis zum Speichern an jedem Tag möglich.",
    "weekly_schedule": "Wöchentliche Öffnungszeiten",
    "weekly_schedule_description": "Wann Gegenstände abgeholt und zurückgegeben werden können.",
    "closed_dates": "Schließtage",
    "closed_dates_description": "Ausnahmen wie Feiertage. Vergangene Tage werden beim Speichern entfernt.",
    "no_closed_dates": "Keine kommenden Schließtage.",
    "add_closed_date": "Schließtag hinzufügen",
    "remove_date": "Tag entfernen",
    "select_date": "Datum auswählen",
    "preview": "Vorschau",
    "preview_description": "So sehen Besucher die Öffnungszeiten.",
    "always_closed": "Keine Öffnungszeiten, der Standort ist immer geschlossen.",
    "warning": "Diese Reservierungen haben eine Abholung oder Rückgabe an einem geschlossenen Tag. Sie werden beim Speichern nicht geändert, eventuell möchtest du die Ausleihenden kontaktieren.",
    "pickup": "Abholung von",
    "return": "Rückgabe von",
    "invalid_opening_hours": "Die Öffnungszeiten sind ungültig, bitte überprüfe die Zeiträume.",
    "error": "Beim Speichern der Öffnungszeiten ist etwas schiefgelaufen.",
    "success": "Öffnungszeiten gespeichert.",
    "save": "Speichern"
  }
}
</i18n>
