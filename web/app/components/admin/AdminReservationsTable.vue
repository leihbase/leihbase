<template>
  <HorizontalScroll>
    <table cellspacing="0">
      <thead>
        <tr>
          <th>{{ t("start") }}</th>
          <th>{{ t("end") }}</th>
          <th>{{ t("product") }}</th>
          <th>{{ t("user") }}</th>
          <th>{{ t("picked_up") }}</th>
          <th>{{ t("returned") }}</th>
          <th>{{ t("deposit") }}</th>
          <th>{{ t("note") }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="reservation in reservations"
          :class="{
            cancelled: reservation.cancelled,
            warn: showWarning ? showWarning(reservation) : false,
          }"
          @click="handleReservationClick(reservation)"
        >
          <td
            :class="{
              start: true,
              highlight:
                highlightDate === 'start' ||
                highlightDate === 'both' ||
                (highlightDate === 'overdue' && !reservation.started) ||
                (highlightDate === 'date' &&
                  date &&
                  isSameDate(date, new Date(reservation.start))),
            }"
          >
            {{ formatDate(reservation.start, "ddd, DD.MM", locale) }}
          </td>
          <td
            :class="{
              end: true,
              highlight:
                highlightDate === 'end' ||
                highlightDate === 'both' ||
                (highlightDate === 'overdue' &&
                  reservation.started &&
                  !reservation.ended) ||
                (highlightDate === 'date' &&
                  date &&
                  isSameDate(date, new Date(reservation.end))),
            }"
          >
            {{ formatDate(reservation.end, "ddd, DD.MM", locale) }}
          </td>
          <td>
            <NuxtLink
              :to="`/link/product/${reservation.expand.product.id}`"
              target="_blank"
              @click.stop
            >
              {{ reservation.expand.product.name }}
            </NuxtLink>
          </td>
          <td>{{ reservation.expand?.user?.name }}</td>
          <td>
            <Check v-if="reservation.started" class="check" />
            <Xmark v-else class="xmark" />
          </td>
          <td>
            <Check v-if="reservation.ended" class="check" />
            <Xmark v-else class="xmark" />
          </td>
          <td>{{ formatCurrency(reservation.deposit) }}</td>
          <td>
            <Tooltip v-if="reservation.note" :html="reservation.note">
              <MessageText class="note-icon" />
            </Tooltip>
          </td>
        </tr>
      </tbody>
    </table>
  </HorizontalScroll>
</template>

<script setup lang="ts">
import { formatDate, isSameDate } from "@@/lib/date";
import type { Reservation } from "@@/models/reservation";
import { Check, MessageText, Xmark } from "@iconoir/vue";
import HorizontalScroll from "../core/HorizontalScroll.vue";
import Tooltip from "../core/Tooltip.vue";

const { formatCurrency } = useCurrency();
const { t, locale } = useI18n({
  useScope: "local",
});
const emit = defineEmits<{ select: [reservation: Reservation] }>();

defineProps<{
  reservations: Reservation[];
  date?: Date;
  highlightDate: "start" | "end" | "date" | "both" | "overdue";
  showWarning?: (r: Reservation) => boolean;
}>();

function handleReservationClick(reservation: Reservation) {
  emit("select", reservation);
}
</script>

<style scoped lang="scss">
table {
  min-width: 100%;
}
th,
td {
  text-align: left;
  padding: 0.5rem;
  max-width: 200px;
  border-bottom: 1px solid
    color-mix(in srgb, var(--text-color-light) 50%, var(--background-color));
  text-overflow: ellipsis;
  text-wrap: nowrap;
  overflow: hidden;
  &.start,
  &.end {
    color: var(--text-color-light);
    &.highlight {
      color: var(--text-color);
    }
  }
}
tr.warn td.highlight {
  color: rgb(172, 19, 19);
}
tr.cancelled td {
  text-decoration: line-through;
  opacity: 0.5;
}

tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.check {
  color: #15b845;
  stroke-width: 3px;
}
.xmark {
  stroke-width: 0.75px;
}
.note-icon {
  width: 1.1em;
  height: 1.1em;
  margin-bottom: -2px;
}
</style>

<style scoped>
sl-tooltip :deep(p),
sl-tooltip :deep(ul),
sl-tooltip :deep(ol) {
  margin-bottom: 0;
}
sl-tooltip :deep(ul),
sl-tooltip :deep(ol) {
  padding-left: 1.333rem;
}
</style>

<i18n lang="json">
{
  "en": {
    "start": "Start",
    "end": "End",
    "product": "Product",
    "user": "User",
    "picked_up": "Picked Up",
    "returned": "Returned",
    "deposit": "Deposit",
    "note": "Note"
  },
  "de": {
    "start": "Start",
    "end": "Ende",
    "product": "Produkt",
    "user": "Nutzer",
    "picked_up": "Abgeholt",
    "returned": "Zurückgegeben",
    "deposit": "Pfand",
    "note": "Notiz"
  }
}
</i18n>
