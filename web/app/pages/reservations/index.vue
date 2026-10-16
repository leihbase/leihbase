<template>
  <Container width="lg" centered>
    <!-- Header -->
    <section class="lb-stack">
      <Heading is="h1" size="xl">{{ t("reservations") }}</Heading>
      <p class="intro">
        {{ t("intro") }}
      </p>
    </section>

    <!-- Active -->
    <section class="lb-stack">
      <Heading is="h2" size="lg">{{ t("active") }}</Heading>
      <ul v-if="current && current.length > 0" class="cards">
        <template v-for="reservation in current" :key="reservation.id">
          <li v-if="data?.products[reservation.product]">
            <ReservationCardButton
              :reservation="reservation"
              :product="data.products[reservation.product]!"
              @click="selectedReservation = reservation"
            />
          </li>
        </template>
      </ul>
      <p v-else>
        <i>{{ t("no_active_reservations") }}</i>
      </p>
    </section>

    <!-- Past -->
    <section v-if="past && past.length > 0" class="lb-stack">
      <Heading is="h2" size="lg">{{ t("past") }}</Heading>
      <ul class="cards">
        <template v-for="reservation in past" :key="reservation.id">
          <li v-if="data?.products[reservation.product]">
            <ReservationCardButton
              :reservation="reservation"
              :product="data.products[reservation.product]!"
              @click="selectedReservation = reservation"
            />
          </li>
        </template>
      </ul>
    </section>
  </Container>
  <ReservationDetailDialog
    :reservation="selectedReservation"
    :product="
      selectedReservation
        ? data?.products[selectedReservation?.product]
        : undefined
    "
    :location="
      selectedReservation
        ? data?.locations[selectedReservation?.location]
        : undefined
    "
    @update="refresh"
    @close="selectedReservation = undefined"
  />
</template>

<script setup lang="ts">
import { getReservationStatus } from "@@/lib/reservation";
import type { Location } from "@@/models/location";
import type { Product } from "@@/models/product";
import { ReservationStatus, type Reservation } from "@@/models/reservation";
import Container from "@/components/core/Container.vue";
import Heading from "@/components/core/Heading.vue";
import ReservationCardButton from "./_components/ReservationCardButton.vue";
import ReservationDetailDialog from "./_components/ReservationDetailDialog.vue";

const { pb, isValid, logout } = usePocketbase();
const userStore = useUserStore();

const selectedReservation = ref<Reservation>();

const { t } = useI18n({
  useScope: "local",
});

const { data, refresh, status } = await useAsyncData<{
  reservations: Reservation[];
  products: { [key: string]: Product };
  locations: { [key: string]: Location };
}>(
  "user_reservations",
  async () => {
    const reservations = await pb.collection("reservations").getFullList({
      filter: pb.filter("user = {:user}", {
        user: pb.authStore?.model?.["id"],
      }),
      sort: "-start",
      requestKey: "user_reservations",
    });
    const products = await pb.collection("products").getFullList({
      filter: reservations.map((r) => `id="${r.product}"`).join("||"),
      requestKey: "reservations_product",
    });
    const locations = await pb.collection("public_locations").getFullList({
      filter: reservations.map((r) => `id="${r.location}"`).join("||"),
      requestKey: "reservations_location",
    });
    return {
      reservations: structuredClone(reservations) as Reservation[],
      products: products.reduce(
        (map, p) => {
          map[p.id] = p as Product;
          return map;
        },
        {} as { [key: string]: Product }
      ),
      locations: locations.reduce(
        (map, p) => {
          map[p.id] = p as Location;
          return map;
        },
        {} as { [key: string]: Location }
      ),
    };
  },
  { lazy: true }
);

const current = computed(() =>
  (data.value?.reservations || []).filter((reservation) => {
    if (
      getReservationStatus(reservation) !== ReservationStatus.Ended &&
      getReservationStatus(reservation) !== ReservationStatus.Cancelled
    ) {
      return true;
    }
    return false;
  })
);

const past = computed(() =>
  (data.value?.reservations || []).filter((reservation) => {
    if (
      getReservationStatus(reservation) === ReservationStatus.Ended ||
      getReservationStatus(reservation) === ReservationStatus.Cancelled
    ) {
      return true;
    }
    return false;
  })
);

useHead({
  title: t("reservations"),
});

if (!isValid.value) {
  logout();
  userStore.logout();
  navigateTo("/login");
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/_breakpoints.scss";

section {
  margin-bottom: var(--fluid-spacing-8);
}

.intro {
  max-width: var(--max-text-width);
}

.cards {
  display: flex;
  list-style: none;
  gap: var(--fluid-spacing-4);
  margin: 0;
  padding: 0;
  flex-wrap: wrap;
  li {
    width: 100%;
  }
  @media (min-width: breakpoints.$breakpoint-md) {
    li {
      width: calc((100% - (var(--fluid-spacing-4) * 1)) * 1 / 2);
    }
  }
  @media (min-width: breakpoints.$breakpoint-lg) {
    li {
      width: calc((100% - (var(--fluid-spacing-4) * 2)) * 1 / 3);
    }
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "reservations": "Reservations",
    "intro": "Here you can manage your reservations. Check your current and past loans, extend deadlines, or cancel reservations as needed.",
    "active": "Active",
    "no_active_reservations": "You currently have no active reservations.",
    "past": "Past"
  },
  "de": {
    "reservations": "Reservierungen",
    "intro": "Hier kannst du deine Reservierungen verwalten. Schau dir deine aktuellen und vergangenen Ausleihen an, verlängere Fristen oder storniere Reservierungen bei Bedarf.",
    "active": "Aktive",
    "no_active_reservations": "Du hast derzeit keine aktiven Reservierungen.",
    "past": "Vergangene"
  }
}
</i18n>
