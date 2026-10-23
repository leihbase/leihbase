<template>
  <div>
    <Heading is="h3" size="md" class="heading">{{ title }}</Heading>
    <ul v-if="reservations && reservations.length > 0">
      <li
        v-for="reservation in reservations"
        :key="reservation.id"
        :class="{ active: isToday(reservation) }"
      >
        <span class="timespan">
          {{ formatDate(reservation.start, "DD.MM.YYYY", locale) }}
          - {{ formatDate(reservation.end, "DD.MM.YYYY", locale) }}
        </span>
        <span
          v-if="userReservationIds.includes(reservation.id)"
          class="user me"
        >
          <UserIcon class="user-icon" /> Du
        </span>
      </li>
    </ul>
    <p v-else><i>Keine kommenden Reservierungen</i></p>
  </div>
</template>

<script setup>
import { formatDate } from "@@/lib/date";
import { isToday } from "@@/lib/reservation";
import { User as UserIcon } from "@iconoir/vue";
import Heading from "./core/Heading.vue";

const { locale } = useI18n();

defineProps({
  title: {
    type: String,
    default: "Reservations",
  },
  reservations: {
    type: Array,
    default: [],
  },
});

const userStore = useUserStore();

const userReservationIds = computed(() =>
  userStore.reservations.map((r) => r.id)
);
</script>

<style scoped>
.heading {
  margin-bottom: var(--fluid-spacing-4);
}
ul {
  --border-color: var(--text-color-light);
  border: 1px solid var(--border-color);
  margin: 0;
  padding: 0;
  list-style: none;
  border-radius: var(--border-radius);
  display: inline-block;
}
li {
  line-height: 2.5;
  padding: 0 1rem;
  display: flex;
  align-items: center;
}
li.active {
  font-weight: var(--font-weight-semibold);
}
li.active::before {
  content: "";
  width: 0.333rem;
  height: 0.333rem;
  border-radius: 0.333rem;
  background-color: red;
  margin-right: 0.5rem;
}
li:not(:last-child) {
  border-bottom: 1px solid var(--border-color);
}
span.user {
  display: inline-flex;
  align-items: center;
  line-height: 1;
  font-size: var(--font-size-sm);
  margin-left: 1rem;
}
span.user.me {
  background-color: var(--secondary-color);
  border-radius: 999px;
  padding: 0.25rem 0.75rem;
}
.user-icon {
  display: inline;
  height: 1em;
  width: 1em;
  margin-right: 0.25em;
}
</style>
