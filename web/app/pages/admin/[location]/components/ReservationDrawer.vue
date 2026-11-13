<template>
  <Drawer :headerOffset="false" inset v-model:open="open">
    <header>
      <!-- Title -->
      <Heading is="h2" size="lg" cap>{{
        state === "new" ? t("new") : t("edit")
      }}</Heading>

      <!-- Actions -->
      <div class="buttons">
        <Button
          v-if="state === 'edit'"
          variant="secondary"
          circle
          @click="handleRemoveClick"
        >
          <Trash />
        </Button>
        <Button variant="secondary" circle @click="open = false">
          <Xmark />
        </Button>
      </div>
    </header>

    <!-- Cancelation status warning -->
    <Alert v-if="props.reservation?.cancelled" variant="warning">{{
      t("reservation_is_cancelled")
    }}</Alert>

    <form @submit.prevent="handleSubmit">
      <!-- Product picker -->
      <RecordPickerInput
        id="reservation-drawer-product-input"
        :label="t('product')"
        collection="products"
        :columns="['name']"
        :filter="pb.filter('location = {:location}', { location: location.id })"
        v-model="productId"
        required
      />
      <!-- User picker -->
      <RecordPickerInput
        id="reservation-drawer-user-input"
        :label="t('user')"
        collection="users"
        :columns="['name', 'email']"
        v-model="userId"
      />

      <!-- Borrow agreement acceptance status -->
      <div
        v-if="location.borrow_agreement && userId"
        class="box borrow-agreement"
        data-testid="reservation-drawer-borrow-agreement"
      >
        <strong>{{ t("borrow_agreement.title") }}</strong>
        <p v-if="acceptanceLoadError" class="load-error">
          {{ t("borrow_agreement.load_error") }}
        </p>
        <LoadingSpinner v-else-if="acceptance === undefined" size="sm" />
        <div v-else class="row">
          <p :class="['status', acceptance ? 'accepted' : 'not-accepted']">
            <PageEdit aria-hidden="true" />
            {{ acceptanceStatus }}
          </p>
          <Button
            v-if="acceptanceAction"
            variant="outline"
            size="sm"
            :data-testid="`reservation-drawer-borrow-agreement-${acceptanceAction}`"
            @click="acceptanceDialog = acceptanceAction"
          >
            {{ t(`borrow_agreement.${acceptanceAction}`) }}
          </Button>
        </div>
      </div>

      <!-- Dates -->
      <DateInput
        id="reservation-drawer-start-input"
        :label="t('start')"
        v-model="start"
        required
      />
      <DateInput
        id="reservation-drawer-end-input"
        :label="t('end')"
        v-model="end"
        required
      />

      <!-- Started/ended -->
      <Switch
        id="reservation-drawer-started-input"
        :label="t('collected')"
        v-model="started"
      />
      <Switch
        id="reservation-drawer-ended-input"
        :label="t('returned')"
        v-model="ended"
      />

      <!-- Deposit -->
      <!-- Show as description the default deposit of this product (when known) -->
      <Input
        id="reservation-drawer-deposit-input"
        :label="t('deposit')"
        v-model="deposit"
        type="number"
        :description="
          productId &&
          productId === reservation?.product &&
          reservation?.expand?.product?.deposit
            ? t('deposit_description', [
                reservation?.expand?.product?.name,
                formatCurrency(reservation?.expand?.product?.deposit),
              ])
            : ''
        "
      >
        <template #prefix>{{ currencySymbol }}</template>
      </Input>

      <!-- Notes -->
      <RichTextarea
        id="reservation-drawer-note-input"
        :label="t('note')"
        v-model="note"
      />

      <!-- Cancelled -->
      <Switch
        id="reservation-drawer-cancelled-input"
        :label="t('cancelled')"
        v-model="cancelled"
      />

      <!-- Sent emails -->
      <div class="box sent-emails">
        <strong>{{ t("sent_emails") }}</strong>
        <ul
          v-if="
            props.reservation?.sent_emails &&
            props.reservation.sent_emails.length > 0
          "
        >
          <li v-for="email in props.reservation?.sent_emails">
            <Mail /> {{ t("email_" + email) }}
          </li>
        </ul>
        <p v-else>
          {{ t("sent_emails_none") }}
        </p>
      </div>

      <!-- Error status -->
      <Alert v-if="error" variant="error">{{ error }}</Alert>

      <!-- Submit/cancel -->
      <footer>
        <Button :loading="isSubmitting" type="submit">{{ t("save") }}</Button>
        <Button variant="secondary" @click="handleCancelClick">{{
          t("cancel")
        }}</Button>
      </footer>
    </form>
  </Drawer>

  <!-- Removal confirmation dialog -->
  <Dialog
    v-model:open="removeDialogOpen"
    inset
    :title="t('remove_dialog.title')"
  >
    <p class="remove-dialog-text">{{ t("remove_dialog.text") }}</p>
    <footer>
      <Button :loading="isRemoving" @click="handleRemoveDialogConfirmClick">
        {{ t("remove_dialog.confirm") }}
      </Button>
      <Button variant="secondary" @click="handleRemoveDialogCancelClick">
        {{ t("remove_dialog.cancel") }}
      </Button>
    </footer>
  </Dialog>

  <!-- Borrow agreement acceptance confirmation dialog -->
  <BorrowAgreementAcceptanceDialog
    v-if="userId"
    v-model:action="acceptanceDialog"
    :location="location"
    :user="userId"
    :acceptance="acceptance"
    @change="(newAcceptance) => (acceptance = newAcceptance)"
  />
</template>

<script lang="ts" setup>
import { formatDate } from "@@/lib/date";
import type { BorrowAgreementAcceptance } from "@@/models/borrowAgreement";
import type { Location } from "@@/models/location";
import type { Reservation } from "@@/models/reservation";
import RecordPickerInput from "@/components/admin/RecordPickerInput.vue";
import Alert from "@/components/core/Alert.vue";
import Button from "@/components/core/Button.vue";
import DateInput from "@/components/core/DateInput.vue";
import Dialog from "@/components/core/Dialog.vue";
import Drawer from "@/components/core/Drawer.vue";
import Heading from "@/components/core/Heading.vue";
import Input from "@/components/core/Input.vue";
import LoadingSpinner from "@/components/core/LoadingSpinner.vue";
import RichTextarea from "@/components/core/RichTextarea.vue";
import Switch from "@/components/core/Switch.vue";
import { Mail, PageEdit, Trash, Xmark } from "@iconoir/vue";
import BorrowAgreementAcceptanceDialog from "./BorrowAgreementAcceptanceDialog.vue";

const { pb } = usePocketbase();
const { formatCurrency, symbol: currencySymbol } = useCurrency();
const { t, locale } = useI18n({
  useScope: "local",
});

const props = defineProps<{
  state: "new" | "edit";
  location: Location;
  reservation: Reservation | null;
}>();
const open = defineModel("open");
const emit = defineEmits<{ update: [] }>();

const productId = ref<string>();
const userId = ref<string>();
const start = ref<Date>();
const end = ref<Date>();
const started = ref<boolean>(false);
const ended = ref<boolean>(false);
const cancelled = ref<boolean>(false);
const deposit = ref<number>(0);
const note = ref<string>();
const error = ref<string | null>(null);

watch(open, (isOpening) => {
  if (!isOpening) return;
  error.value = null;
  productId.value = props.reservation?.product || undefined;
  userId.value = props.reservation?.user || undefined;
  start.value = props.reservation?.start
    ? new Date(props.reservation.start)
    : undefined;
  end.value = props.reservation?.end
    ? new Date(props.reservation.end)
    : undefined;
  started.value = props.reservation?.started || false;
  ended.value = props.reservation?.ended || false;
  cancelled.value = props.reservation?.cancelled || false;
  deposit.value = props.reservation?.deposit || 0;
  if (props.reservation) {
    note.value = props.reservation?.note || "";
  } else if (props.location.note_default) {
    // NOTE: this weird HTML formatting is required because the Quill richt-text
    // editor for some reason wants the HTML formatted this way, otherwise it
    // inserts extra paragraphs...
    note.value = props.location.note_default.replace(
      /<\/p>[\n\r]+<p>/g,
      "\n</p><p>"
    );
  } else {
    note.value = "";
  }
});

const isSubmitting = ref(false);
async function handleSubmit() {
  const formData = {
    user: userId.value,
    product: productId.value,
    location: props.location.id,
    start: start.value,
    end: end.value,
    started: started.value,
    ended: ended.value,
    cancelled: cancelled.value,
    deposit: deposit.value,
    note: note.value === "<p><br></p>" ? "" : note.value,
  };
  error.value = "";
  isSubmitting.value = true;
  try {
    if (props.state === "new") {
      // Create new reservation
      await pb.collection("reservations").create(formData);
    } else if (props.state === "edit") {
      if (!props.reservation?.id) {
        throw new Error("reservation_undefined");
      }
      // Update existing reservation
      await pb
        .collection("reservations")
        .update(props.reservation.id, formData);
    }
    open.value = false;
    isSubmitting.value = false;
    emit("update");
  } catch (err) {
    isSubmitting.value = false;
    if (err instanceof Error) {
      switch (err?.message) {
        case "Overlapping_reservation.":
          error.value = t("errors.overlapping_reservation");
          break;
        case "Start_before_today.":
          error.value = t("errors.start_before_today");
          break;
        case "End_before_today.":
          error.value = t("errors.end_before_today");
          break;
        case "Start_and_end_equal.":
          error.value = t("errors.start_and_end_equal");
          break;
        case "End_before_start.":
          error.value = t("errors.end_before_start");
          break;
        default:
          error.value = t("errors.general");
      }
    } else {
      error.value = t("errors.general");
    }
  }
}

function handleCancelClick() {
  open.value = false;
}

const removeDialogOpen = ref(false);

function handleRemoveClick() {
  removeDialogOpen.value = true;
}

const isRemoving = ref(false);
async function handleRemoveDialogConfirmClick() {
  if (!props.reservation?.id) {
    console.error("No reservation id given to delete");
    return;
  }
  isRemoving.value = true;
  try {
    await pb.collection("reservations").delete(props.reservation.id);
    removeDialogOpen.value = false;
    open.value = false;
    isRemoving.value = false;
    emit("update");
  } catch (e) {
    isRemoving.value = false;
    console.error("Error removing reservation", e);
  }
}

function handleRemoveDialogCancelClick() {
  removeDialogOpen.value = false;
}

// Borrow agreement acceptance of the selected user, `undefined` while loading
const { fetch: fetchAcceptance } = useAdminBorrowAgreementAcceptances(
  props.location
);
const acceptance = ref<BorrowAgreementAcceptance | null>();
const acceptanceLoadError = ref(false);
watch([open, userId], async ([isOpen, user]) => {
  if (!isOpen) return;
  acceptance.value = undefined;
  acceptanceLoadError.value = false;
  try {
    const result = await fetchAcceptance(user);
    // Ignore the result when another user has been selected in the meantime
    if (user === userId.value) {
      acceptance.value = result;
    }
  } catch (e) {
    console.error("Error loading borrow agreement acceptance", e);
    if (user === userId.value) {
      acceptanceLoadError.value = true;
    }
  }
});

const acceptanceStatus = computed(() => {
  if (!acceptance.value) {
    return t("borrow_agreement.not_accepted");
  }
  return t(
    acceptance.value.recorded_by
      ? "borrow_agreement.accepted_in_store"
      : "borrow_agreement.accepted",
    { date: formatDate(acceptance.value.created, "DD.MM.YYYY", locale.value) }
  );
});

// Action of the button next to the status: record when not accepted, or remove
// when recorded in the store (e.g. by mistake)
const acceptanceAction = computed(() => {
  if (!acceptance.value) {
    return "record";
  }
  return acceptance.value.recorded_by ? "remove" : null;
});

// Acceptance action to confirm in the dialog
const acceptanceDialog = ref<"record" | "remove" | null>(null);
</script>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: var(--fluid-spacing-4);
}
header .buttons {
  display: flex;
  gap: 1rem;
}
footer {
  display: flex;
  gap: 1rem;
}
.remove-dialog-text {
  margin-bottom: 1.666rem;
}
.box {
  width: 100%;
  background-color: var(--surface-neutral-color);
  padding: 1rem;
  border-radius: var(--border-radius);
}
.borrow-agreement {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
/* Status with its button next to it, wrapping when there is no room */
.borrow-agreement .row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem 1rem;
}
.borrow-agreement p {
  margin: 0;
}
.borrow-agreement .load-error {
  color: rgb(172, 19, 19);
}
.borrow-agreement .status {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}
.borrow-agreement .status svg {
  flex-shrink: 0;
  width: 1.1em;
  height: 1.1em;
}
.borrow-agreement .accepted svg {
  color: #15b845;
}
.borrow-agreement .not-accepted svg {
  color: rgb(172, 19, 19);
}
.sent-emails ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.sent-emails p {
  margin: 0;
}
.sent-emails li {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.sent-emails li svg {
  height: 1.2em;
  width: 1.2em;
}
</style>

<i18n lang="json">
{
  "en": {
    "new": "New Reservation",
    "edit": "Edit Reservation",
    "reservation_is_cancelled": "This reservation is cancelled",
    "product": "Product",
    "user": "User",
    "start": "Start",
    "end": "End",
    "cancelled": "Cancelled",
    "collected": "Picked up",
    "returned": "Returned",
    "deposit": "Deposit",
    "deposit_description": "Deposit of {0} is {1}",
    "note": "Note",
    "save": "Save",
    "cancel": "Cancel",
    "sent_emails": "Sent E-mails",
    "sent_emails_none": "None",
    "email_confirmation": "Reservation confirmation",
    "email_start_reminder": "Reservation start reminder",
    "email_end_reminder": "Reservation end reminder",
    "borrow_agreement": {
      "title": "Borrowing terms",
      "accepted": "Accepted online on {date}",
      "accepted_in_store": "Accepted in the store on {date}",
      "not_accepted": "Not accepted yet",
      "record": "Record acceptance in store",
      "remove": "Remove acceptance",
      "load_error": "Could not load the acceptance status, please try again."
    },
    "remove_dialog": {
      "title": "Remove reservieration",
      "text": "Are you sure you want to remove this reservation? There is no way to undo this.",
      "confirm": "Remove reservation",
      "cancel": "Cancel"
    },
    "errors": {
      "overlapping_reservation": "There is already a reservation for this product during the given period.",
      "start_before_today": "The start of the reservation is before today.",
      "end_before_today": "The end of the reservation is before today.",
      "start_and_end_equal": "The start and end of the reservation can't be on the same day.",
      "end_before_start": "The end can't be before the start of the reservation.",
      "general": "Something went wrong while creating the reservation, please try again."
    }
  },
  "de": {
    "new": "Neue Reservierung",
    "edit": "Reservierung bearbeiten",
    "reservation_is_cancelled": "Diese Reservierung ist annuliert",
    "product": "Produkt",
    "user": "Nutzer:in",
    "start": "Start",
    "end": "Ende",
    "cancelled": "Annuliert",
    "collected": "Abgeholt",
    "returned": "Zurückgegeben",
    "deposit": "Pfand",
    "deposit_description": "Pfand von {0} ist {1}",
    "note": "Notiz  ",
    "save": "Speichern",
    "cancel": "Abbrechen",
    "sent_emails": "Gesendete E-Mails",
    "sent_emails_none": "Keine",
    "email_confirmation": "Reservierungsbestätigung",
    "email_start_reminder": "Erinnerung: Abholung",
    "email_end_reminder": "Erinnerung: Zurückbringen",
    "borrow_agreement": {
      "title": "Leihbedingungen",
      "accepted": "Online akzeptiert am {date}",
      "accepted_in_store": "Vor Ort akzeptiert am {date}",
      "not_accepted": "Noch nicht akzeptiert",
      "record": "Akzeptanz vor Ort erfassen",
      "remove": "Akzeptanz entfernen",
      "load_error": "Der Akzeptanzstatus konnte nicht geladen werden, bitte versuche es erneut."
    },
    "remove_dialog": {
      "title": "Reservierung entfernen",
      "text": "Bist du sicher, dass du diese Reservierung endgültig entfernen möchtest?",
      "confirm": "Reservierung entfernen",
      "cancel": "Annulieren"
    },
    "errors": {
      "overlapping_reservation": "Das Produkt ist für diesen Termin bereits reserviert.",
      "start_before_today": "Der Beginn der Reservierung liegt vor dem heutigen Tag.",
      "end_before_today": "Das Enddatum der Reservierung liegt vor dem heutigen Tag",
      "start_and_end_equal": "Beginn und Ende der Reservierung dürfen nicht am selben Tag liegen.",
      "end_before_start": "Ende kann nicht vor Beginn der Reservierung liegen.",
      "general": "Beim Erstellen deiner Reservierung ist ein Fehler aufgetreten, bitte versuche es erneut."
    }
  }
}
</i18n>
