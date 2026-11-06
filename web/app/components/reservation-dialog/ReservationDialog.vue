<template>
  <Dialog v-model:open="isOpen" inset :title="t('reserve')">
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
        :key="borrowAgreement.id"
        :location="location"
        :borrow-agreement="borrowAgreement"
      />
    </form>
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
import type {
  BorrowAgreement,
  BorrowAgreementAcceptance,
} from "~~/models/borrowAgreement.js";
import type { Location } from "~~/models/location.js";
import Alert from "../core/Alert.vue";
import Button from "../core/Button.vue";
import Dialog from "../core/Dialog.vue";
import ReservationBorrowAgreementStep from "./ReservationBorrowAgreementStep.vue";
import ReservationDatesStep from "./ReservationDatesStep.vue";

const { pb, user } = usePocketbase();
const { t } = useI18n({ useScope: "local" });
const nuxtApp = useNuxtApp();
const userStore = useUserStore();
const { createReservation } = useCreateReservation();

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
const requiresBorrowAgreement = ref(false);

watch(isOpen, (newValue) => {
  if (newValue) {
    checkBorrowAgreementAcceptance();
  } else {
    start.value = undefined;
    end.value = undefined;
    step.value = "dates";
    borrowAgreement.value = undefined;
    reservationCreationError.value = undefined;
  }
});

/**
 * Checks if the user has to accept the current borrow agreement of the
 * location. When this fails the reservation is submitted without accepting, and
 * the server rejects it if accepting is required.
 */
async function checkBorrowAgreementAcceptance() {
  requiresBorrowAgreement.value = false;
  if (!location.value?.borrow_agreement || !user.value?.id) {
    return;
  }
  try {
    const acceptances = await pb
      .collection("borrow_agreement_acceptances")
      .getList<BorrowAgreementAcceptance>(1, 1, {
        filter: pb.filter(
          "user = {:user} && borrow_agreement = {:borrowAgreement}",
          {
            user: user.value.id,
            borrowAgreement: location.value.borrow_agreement,
          }
        ),
        skipTotal: true,
      });
    requiresBorrowAgreement.value = acceptances.items.length === 0;
  } catch (e) {
    console.error("Failed to check borrow agreement acceptance", e);
  }
}

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
    step.value = "agreement";
  } catch (e) {
    reservationCreationError.value = t("errors.borrow_agreement_load");
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
  const result = await createReservation(location.value, {
    user: user.value.id,
    product: product.value.id,
    start: start.value,
    end: end.value,
    message: message.value,
    // Only set when the borrow agreement step has been shown
    borrow_agreement: borrowAgreement.value?.id,
  });

  if (result.status === "borrow_agreement_not_accepted") {
    // The borrow agreement has changed in the meantime, show the current one
    location.value = await pb
      .collection("public_locations")
      .getOne<Location>(location.value.id);
    await showBorrowAgreement();
    reservationCreationError.value = t("errors.borrow_agreement_changed");
    return;
  }
  if (result.status === "error") {
    isSubmittingReservation.value = false;
    reservationCreationError.value = result.message;
    return;
  }

  await userStore.fetchUserReservations();
  nuxtApp.callHook("app:user:reservation:create", result.reservation);
  isSubmittingReservation.value = false;
  isOpen.value = false;
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
    "reserve_now_button": "Reserve now",
    "continue_button": "Continue to borrowing terms",
    "back_button": "Back",
    "errors": {
      "borrow_agreement_changed": "The borrowing terms have changed, please read and accept them.",
      "borrow_agreement_load": "Something went wrong while loading the borrowing terms, please try again."
    }
  },
  "de": {
    "reserve": "Reservieren",
    "reserve_now_button": "Jetzt reservieren",
    "continue_button": "Weiter zu den Leihbedingungen",
    "back_button": "Zurück",
    "errors": {
      "borrow_agreement_changed": "Die Leihbedingungen haben sich geändert, bitte lies und akzeptiere sie.",
      "borrow_agreement_load": "Beim Laden der Leihbedingungen ist ein Fehler aufgetreten, bitte versuche es erneut."
    }
  }
}
</i18n>
