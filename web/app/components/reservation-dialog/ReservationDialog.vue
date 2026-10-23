<template>
  <Dialog v-model:open="isOpen" inset :title="t('reserve')">
    <div class="dialog">
      <form v-if="product && location" :id="formId" @submit.prevent="onSubmit">
        <ReservationDatesStep
          v-if="step === 'dates'"
          :location="location"
          :product="product"
          v-model:start="start"
          v-model:end="end"
          v-model:message="message"
        />
        <ReservationBorrowAgreementStep
          v-if="step === 'agreement' && borrowAgreement"
          :location="location"
          :borrow-agreement="borrowAgreement"
          v-model:accepted="isBorrowAgreementAccepted"
        />
      </form>
    </div>
    <template #footer>
      <div class="footer">
        <Alert
          v-if="reservationCreationError"
          variant="error"
          data-testid="reservation-form-error"
          class="alert"
        >
          {{ reservationCreationError }}
        </Alert>

        <div class="buttons">
          <Button
            v-if="step === 'agreement'"
            variant="secondary"
            size="lg"
            data-testid="reserve-back"
            @click="step = 'dates'"
          >
            {{ t("back_button") }}
          </Button>
          <Button
            :loading="isSubmittingReservation"
            size="lg"
            type="submit"
            :form="formId"
            data-testid="reserve-submit"
          >
            {{
              step === "dates" && requiresBorrowAgreement
                ? t("continue_button")
                : t("reserve_now_button")
            }}
          </Button>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import type { BorrowAgreement } from "~~/models/borrowAgreement.js";
import type { Location } from "~~/models/location.js";
import type { Reservation } from "~~/models/reservation.js";
import { ClientResponseError } from "pocketbase";
import Alert from "../core/Alert.vue";
import Button from "../core/Button.vue";
import Dialog from "../core/Dialog.vue";
import ReservationBorrowAgreementStep from "./ReservationBorrowAgreementStep.vue";
import ReservationDatesStep from "./ReservationDatesStep.vue";

const { pb, user } = usePocketbase();
const { t } = useI18n({ useScope: "local" });
const nuxtApp = useNuxtApp();
const userStore = useUserStore();

const { isOpen, product, location } = useReservationDialog();
const formId = useId();

// Fields
const start = ref<Date>();
const end = ref<Date>();
const message = ref<string>();

const reservationCreationError = ref<string>();
const isSubmittingReservation = ref(false);

// Borrow agreement
const step = ref<"dates" | "agreement">("dates");
const borrowAgreement = ref<BorrowAgreement>();
const isBorrowAgreementAccepted = ref(false);
const requiresBorrowAgreement = computed(
  () =>
    !!location.value?.borrow_agreement &&
    !(user.value?.accepted_borrow_agreements || []).includes(
      location.value.borrow_agreement
    )
);

watch(isOpen, (newValue) => {
  if (!newValue) {
    start.value = undefined;
    end.value = undefined;
    step.value = "dates";
    borrowAgreement.value = undefined;
    isBorrowAgreementAccepted.value = false;
    reservationCreationError.value = undefined;
  }
});

/**
 * Shows the current borrow agreement of the location, to be accepted before
 * creating the reservation
 */
async function showBorrowAgreement() {
  if (!location.value?.borrow_agreement) {
    return;
  }
  isSubmittingReservation.value = true;
  try {
    borrowAgreement.value = await pb
      .collection("borrow_agreements")
      .getOne<BorrowAgreement>(location.value.borrow_agreement);
    isBorrowAgreementAccepted.value = false;
    step.value = "agreement";
  } catch (e) {
    reservationCreationError.value = t("errors.general");
  } finally {
    isSubmittingReservation.value = false;
  }
}

async function onSubmit() {
  if (!location.value || !product.value) {
    console.error("Can't create reservation, no location or product defined");
    return;
  }
  if (!user.value?.id) {
    console.error("Can't create reservation, no user id defined");
    return;
  }

  reservationCreationError.value = undefined;

  // Show the borrow agreement first, if it has not been accepted before
  if (step.value === "dates" && requiresBorrowAgreement.value) {
    await showBorrowAgreement();
    return;
  }

  isSubmittingReservation.value = true;
  let reservation;
  try {
    reservation = (await pb.collection("reservations").create({
      user: user.value?.id,
      product: product.value.id,
      start: start.value,
      end: end.value,
      message: message.value,
      send_confirmation: true,
      borrow_agreement: requiresBorrowAgreement.value
        ? borrowAgreement.value?.id
        : undefined,
    })) as Reservation;
  } catch (e) {
    isSubmittingReservation.value = false;
    if (e instanceof ClientResponseError && e.status === 400 && e.message) {
      switch (e.message) {
        case "User_not_verified.":
          reservationCreationError.value = t("errors.user_not_verified");
          break;
        case "Product_has_open_reservation.":
          reservationCreationError.value = t(
            "errors.product_has_open_reservation",
            {
              email: location.value.email,
            }
          );
          break;
        case "User_has_open_reservation.":
          reservationCreationError.value = t(
            "errors.user_has_open_reservation",
            {
              email: location.value.email,
            }
          );
          break;
        case "Date_range_too_long.":
          reservationCreationError.value = t("errors.date_range_too_long", {
            days: location.value.max_reservation_days || 14,
            email: location.value.email,
          });
          break;
        case "Overlapping_reservation.":
          reservationCreationError.value = t("errors.overlapping_reservation");
          break;
        case "Start_before_today.":
          reservationCreationError.value = t("errors.start_before_today");
          break;
        case "End_before_today.":
          reservationCreationError.value = t("errors.end_before_today");
          break;
        case "Start_and_end_equal.":
          reservationCreationError.value = t("errors.start_and_end_equal");
          break;
        case "End_before_start.":
          reservationCreationError.value = t("errors.end_before_start");
          break;
        case "Reservation_system_disabled.":
          reservationCreationError.value = t(
            "errors.reservation_system_disabled"
          );
          break;
        case "Borrow_agreement_not_accepted.":
          // The borrow agreement has changed in the meantime, show the
          // current one
          location.value = await pb
            .collection("public_locations")
            .getOne<Location>(location.value.id);
          await showBorrowAgreement();
          reservationCreationError.value = t("errors.borrow_agreement_changed");
          break;
        case "Reservation_start_too_far_in_future.":
          reservationCreationError.value = t(
            "errors.reservation_start_too_far_in_future",
            {
              days: location.value.reservation_start_limit,
              email: location.value.email,
            }
          );
          break;
      }
      if (!reservationCreationError.value) {
        reservationCreationError.value = t("errors.general");
      }
    }
  }

  if (!reservation) {
    return;
  }

  // Refresh the user, to include newly accepted borrow agreements
  await Promise.all([
    userStore.fetchUserReservations(),
    pb.collection("users").authRefresh(),
  ]);
  nuxtApp.callHook("app:user:reservation:create", reservation);
  isSubmittingReservation.value = false;
  isOpen.value = false;
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/breakpoints.scss";

// Fill the height of the (full screen) dialog on mobile
.dialog {
  min-height: 100%;
  display: flex;
  flex-direction: column;

  @media screen and (min-width: breakpoints.$breakpoint-sm) {
    min-height: 0;
  }
}
.dialog form {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.footer {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.footer .alert {
  margin: 0;
}
.footer .buttons {
  display: flex;
  gap: 1rem;
}
.footer .buttons > :last-child {
  flex-grow: 1;
}
</style>

<i18n lang="json">
{
  "en": {
    "reserve": "Reserve",
    "reserve_now_button": "Reserve now",
    "continue_button": "Continue to borrowing terms",
    "back_button": "Back",
    "errors": {
      "user_not_verified": "Confirm your e-mail address before placing a reservation.",
      "product_has_open_reservation": "This product is currently not available.",
      "user_has_open_reservation": "You have an open reservation for this product. Reach out on {email} to extend or change your reservation.",
      "date_range_too_long": "Products can't be reserved for longer than {days} days. Reach out on {email} to discuss a longer period.",
      "overlapping_reservation": "The product is already reserved for this period.",
      "start_before_today": "The start of the reservation is before today.",
      "end_before_today": "The end of the reservation is before today.",
      "start_and_end_equal": "The start and end of the reservation can't be on the same day.",
      "end_before_start": "The end can't be befor the start of the reservation.",
      "reservation_system_disabled": "Reservations are not allowed for this location.",
      "reservation_start_too_far_in_future": "Reservations can't start more than {days} days in the future. Reach out on {email} to discuss.",
      "borrow_agreement_changed": "The borrowing terms have changed, please read and accept them.",
      "general": "Something went wrong while creating the reservation, please try again."
    }
  },
  "de": {
    "reserve": "Reservieren",
    "reserve_now_button": "Jetzt reservieren",
    "continue_button": "Weiter zu den Leihbedingungen",
    "back_button": "Zurück",
    "errors": {
      "user_not_verified": "Bestätige deine E-Mail-Adresse, bevor du reservierst.",
      "product_has_open_reservation": "Diesen Gegenstand ist derzeit nicht verfügbar.",
      "user_has_open_reservation": "Du hast diesen Gegenstand bereits reserviert. Wenn du deine Reservierung verlängern oder ändern möchtest, schreibe eine Mail an {email}.",
      "date_range_too_long": "Produkte können nicht länger als {days} Tage reserviert werden. Kontaktiere uns unter {email}, um einen längeren Zeitraum zu besprechen.",
      "overlapping_reservation": "Das Produkt ist für diesen Termin bereits reserviert.",
      "start_before_today": "Der Beginn der Reservierung liegt vor dem heutigen Tag.",
      "end_before_today": "Das Enddatum der Reservierung liegt vor dem heutigen Tag.",
      "start_and_end_equal": "Beginn und Ende der Reservierung dürfen nicht am selben Tag liegen.",
      "end_before_start": "Ende kann nicht vor Beginn der Reservierung liegen.",
      "reservation_system_disabled": "Reservierungen sind für diesen Standort nicht erlaubt.",
      "reservation_start_too_far_in_future": "Reservierungen können nicht mehr als {days} Tage im Voraus beginnen. Kontaktiere uns unter {email}, um dies zu besprechen.",
      "borrow_agreement_changed": "Die Leihbedingungen haben sich geändert, bitte lies und akzeptiere sie.",
      "general": "Beim Erstellen deiner Reservierung ist ein Fehler aufgetreten, bitte versuche es erneut."
    }
  }
}
</i18n>
