<template>
  <Dialog v-model:open="isOpen" inset :title="title">
    <form v-if="product && location" :id="formId" @submit.prevent="onSubmit">
      <!-- Step 1: product, date & message -->
      <ReservationDatesStep
        v-if="step === 'dates'"
        :location="location"
        :product="product"
        v-model:start="start"
        v-model:end="end"
        v-model:message="message"
      />
      <!-- Step 2.A: accept required borrow agreement  -->
      <ReservationRequiredBorrowAgreementStep
        v-if="step === 'required-agreement' && borrowAgreement"
        :key="borrowAgreement.id"
        :location="location"
        :borrow-agreement="borrowAgreement"
      />
      <!-- Step 2.B: accept or skip optional borrow agreement  -->
      <ReservationOptionalBorrowAgreementStep
        v-if="step === 'optional-agreement' && borrowAgreement && reservation"
        :key="borrowAgreement.id"
        :location="location"
        :product="product"
        :reservation="reservation"
        :borrow-agreement="borrowAgreement"
      />
      <!-- Step 3: reserved -->
      <ReservationDoneStep
        v-if="step === 'done' && reservation"
        :product="product"
        :reservation="reservation"
        @close="isOpen = false"
      />
    </form>
    <!-- The done step has its own close button -->
    <template v-if="step !== 'done'" #footer>
      <div class="footer">
        <!-- Error message -->
        <Alert
          v-if="error"
          variant="error"
          data-testid="reservation-form-error"
          class="alert"
        >
          {{ error }}
        </Alert>

        <div class="buttons">
          <!-- Back button -->
          <Button
            v-if="step === 'required-agreement'"
            variant="secondary"
            size="lg"
            data-testid="reserve-back"
            @click="step = 'dates'"
          >
            {{ t("back_button") }}
          </Button>
          <!-- Skip button -->
          <Button
            v-if="step === 'optional-agreement'"
            variant="secondary"
            size="lg"
            data-testid="borrow-agreement-later"
            @click="isOpen = false"
          >
            {{ t("accept_later_button") }}
          </Button>
          <!-- Submit button -->
          <Button
            :loading="isSubmitting"
            size="lg"
            type="submit"
            :form="formId"
            data-testid="reserve-submit"
          >
            {{ submitButtonLabel }}
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
import Alert from "../core/Alert.vue";
import Button from "../core/Button.vue";
import Dialog from "../core/Dialog.vue";
import ReservationDatesStep from "./ReservationDatesStep.vue";
import ReservationDoneStep from "./ReservationDoneStep.vue";
import ReservationOptionalBorrowAgreementStep from "./ReservationOptionalBorrowAgreementStep.vue";
import ReservationRequiredBorrowAgreementStep from "./ReservationRequiredBorrowAgreementStep.vue";

const { pb, user } = usePocketbase();
const { t } = useI18n({ useScope: "local" });
const nuxtApp = useNuxtApp();
const userStore = useUserStore();
const { createReservation } = useCreateReservation();
const { hasAcceptedBorrowAgreement, acceptBorrowAgreement } =
  useBorrowAgreementAcceptance();

const { isOpen, product, location } = useReservationDialog();
const formId = useId();

// Fields
const start = ref<Date>();
const end = ref<Date>();
const message = ref<string>();

const step = ref<
  "dates" | "required-agreement" | "optional-agreement" | "done"
>("dates");
const error = ref<string>();
const isSubmitting = ref(false);

// Borrow agreement shown in the agreement steps
const borrowAgreement = ref<BorrowAgreement>();
// If the user should accept the current borrow agreement
const needsAcceptance = ref(false);
// Reservation created by the dialog, shown once reserved
const reservation = ref<Reservation>();

// Once reserved, the optional step is only about the borrow agreement
const title = computed(() =>
  step.value === "optional-agreement"
    ? t("borrow_agreement_title")
    : t("reserve")
);

const submitButtonLabel = computed(() => {
  switch (step.value) {
    case "dates":
      return needsAcceptance.value && !location.value?.borrow_agreement_optional
        ? t("continue_button")
        : t("reserve_now_button");
    case "required-agreement":
      return t("reserve_now_button");
    case "optional-agreement":
      return t("accept_button");
    default:
      return undefined;
  }
});

watch(isOpen, async (newValue) => {
  if (newValue) {
    // Assume no acceptance is needed
    needsAcceptance.value = false;

    // If the location has a borrow agreement
    if (location.value?.borrow_agreement && user.value?.id) {
      // Needs acceptance when not accepted before
      needsAcceptance.value =
        (await hasAcceptedBorrowAgreement(
          user.value.id,
          location.value.borrow_agreement
        )) === false;
    }
  } else {
    // Reset the dialog
    start.value = undefined;
    end.value = undefined;
    step.value = "dates";
    borrowAgreement.value = undefined;
    reservation.value = undefined;
    error.value = undefined;
  }
});

async function onSubmit() {
  error.value = undefined;
  isSubmitting.value = true;
  try {
    switch (step.value) {
      case "dates":
        return await submitDatesStep();
      case "required-agreement":
        return await submitRequiredAgreementStep();
      case "optional-agreement":
        return await submitOptionalAgreementStep();
    }
  } finally {
    isSubmitting.value = false;
  }
}

/**
 * Reserve
 */
async function submitDatesStep() {
  const result = await createReservation(location.value!, reservationData());

  // Expected error when the borrow agreement is required
  if (result.status === "borrow_agreement_not_accepted") {
    // The borrow agreement may have been added after loading the location
    if (!location.value?.borrow_agreement) {
      await reloadLocation();
    }
    borrowAgreement.value = await loadBorrowAgreement();
    // Show the borrow agreement acceptance step
    if (borrowAgreement.value) {
      step.value = "required-agreement";
    } else if (!error.value) {
      error.value = t("errors.borrow_agreement_load");
    }
    return;
  }

  // Error: show it
  if (result.status === "error") {
    error.value = result.message;
    return;
  }

  // Reserved
  await handleReservationCreated(result.reservation);

  // Optional borrow agreement not accepted: offer accepting it
  if (needsAcceptance.value) {
    borrowAgreement.value = await loadBorrowAgreement();
    if (borrowAgreement.value) {
      step.value = "optional-agreement";
      return;
    }
  }

  step.value = "done";
}

/**
 * Reserve & accept
 */
async function submitRequiredAgreementStep() {
  const result = await createReservation(
    location.value!,
    reservationData(borrowAgreement.value?.id)
  );

  // Borrow agreement changed in the meantime: show the current one
  if (result.status === "borrow_agreement_not_accepted") {
    await reloadBorrowAgreement();
    return;
  }

  // Error: show it
  if (result.status === "error") {
    error.value = result.message;
    return;
  }

  // Reserved
  await handleReservationCreated(result.reservation);
  step.value = "done";
}

/**
 * Accept the optional borrow agreement
 */
async function submitOptionalAgreementStep() {
  const result = await acceptBorrowAgreement(
    user.value!.id,
    borrowAgreement.value!.id
  );

  // Borrow agreement changed: show the current one
  if (result.status === "not_current") {
    await reloadBorrowAgreement();
    return;
  }

  // Error: show it
  if (result.status === "error") {
    error.value = result.message;
    return;
  }

  isOpen.value = false;
}

/**
 * The reservation data of the fields, optionally accepting the borrow agreement
 */
function reservationData(acceptedBorrowAgreement?: string) {
  return {
    user: user.value!.id,
    product: product.value!.id,
    start: start.value,
    end: end.value,
    message: message.value,
    borrow_agreement: acceptedBorrowAgreement,
  };
}

/**
 * Updates the reservations of the user, and the page
 */
async function handleReservationCreated(createdReservation: Reservation) {
  reservation.value = createdReservation;
  await userStore.fetchUserReservations();
  nuxtApp.callHook("app:user:reservation:create", createdReservation);
}

/**
 * Loads the current borrow agreement of the location, shows an error when this
 * fails
 */
async function loadBorrowAgreement() {
  if (!location.value?.borrow_agreement) {
    return undefined;
  }
  try {
    return await pb
      .collection("borrow_agreements")
      .getOne<BorrowAgreement>(location.value.borrow_agreement);
  } catch (e) {
    error.value = t("errors.borrow_agreement_load");
    return undefined;
  }
}

/**
 * Reloads the location, to get its current borrow agreement settings. Keeps the
 * loaded location when this fails.
 */
async function reloadLocation() {
  try {
    location.value = await pb
      .collection("public_locations")
      .getOne<Location>(location.value!.id);
  } catch (e) {
    console.error("Failed to reload location", e);
  }
}

/**
 * Reloads the location and its current borrow agreement, after the borrow
 * agreement has changed in the meantime
 */
async function reloadBorrowAgreement() {
  await reloadLocation();
  borrowAgreement.value = await loadBorrowAgreement();
  if (borrowAgreement.value) {
    error.value = t("errors.borrow_agreement_changed");
  }
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/breakpoints.scss";

// Fill the height of the (full screen) dialog on mobile, so steps can grow
form {
  min-height: 100%;
  display: flex;
  flex-direction: column;

  @media screen and (min-width: breakpoints.$breakpoint-sm) {
    min-height: 0;
  }
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
    "borrow_agreement_title": "Borrowing terms",
    "reserve_now_button": "Reserve now",
    "continue_button": "Continue to borrowing terms",
    "back_button": "Back",
    "accept_button": "Accept borrowing terms",
    "accept_later_button": "Accept later",
    "errors": {
      "borrow_agreement_changed": "The borrowing terms have changed, please read and accept them.",
      "borrow_agreement_load": "Something went wrong while loading the borrowing terms, please try again."
    }
  },
  "de": {
    "reserve": "Reservieren",
    "borrow_agreement_title": "Leihbedingungen",
    "reserve_now_button": "Jetzt reservieren",
    "continue_button": "Weiter zu den Leihbedingungen",
    "back_button": "Zurück",
    "accept_button": "Leihbedingungen akzeptieren",
    "accept_later_button": "Später akzeptieren",
    "errors": {
      "borrow_agreement_changed": "Die Leihbedingungen haben sich geändert, bitte lies und akzeptiere sie.",
      "borrow_agreement_load": "Beim Laden der Leihbedingungen ist ein Fehler aufgetreten, bitte versuche es erneut."
    }
  }
}
</i18n>
