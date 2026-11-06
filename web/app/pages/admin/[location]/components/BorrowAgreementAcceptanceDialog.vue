<template>
  <Dialog
    :open="!!action"
    inset
    :title="t(`${action || 'record'}.title`)"
    @update:open="(isOpen) => !isOpen && (action = null)"
  >
    <p class="text">{{ t(`${action || "record"}.text`) }}</p>
    <Alert v-if="error" variant="error">{{ error }}</Alert>
    <footer>
      <Button
        :loading="isSaving"
        data-testid="reservation-drawer-borrow-agreement-confirm"
        @click="handleConfirmClick"
      >
        {{ t(`${action || "record"}.confirm`) }}
      </Button>
      <Button variant="secondary" @click="action = null">
        {{ t("cancel") }}
      </Button>
    </footer>
  </Dialog>
</template>

<script lang="ts" setup>
import type { BorrowAgreementAcceptance } from "@@/models/borrowAgreement";
import type { Location } from "@@/models/location";
import Alert from "@/components/core/Alert.vue";
import Button from "@/components/core/Button.vue";
import Dialog from "@/components/core/Dialog.vue";

const { t } = useI18n({ useScope: "local" });

const props = defineProps<{
  location: Location;
  user: string;
  // Current acceptance of the user, to remove
  acceptance?: BorrowAgreementAcceptance | null;
}>();
const emit = defineEmits<{
  change: [acceptance: BorrowAgreementAcceptance | null];
}>();
// Action to confirm, the dialog is open while set
const action = defineModel<"record" | "remove" | null>("action", {
  required: true,
});

const acceptances = useAdminBorrowAgreementAcceptances(props.location);
const error = ref<string>();
const isSaving = ref(false);

watch(action, () => {
  error.value = undefined;
});

async function handleConfirmClick() {
  isSaving.value = true;
  try {
    if (action.value === "record") {
      emit("change", await acceptances.record(props.user));
    } else if (props.acceptance) {
      await acceptances.remove(props.acceptance);
      emit("change", null);
    }
    action.value = null;
    // Update the status in the reservation tables
    refreshAdminReservations();
  } catch (e) {
    error.value = t("error");
  } finally {
    isSaving.value = false;
  }
}
</script>

<style scoped>
.text {
  margin-bottom: 1.666rem;
}
footer {
  display: flex;
  gap: 1rem;
}
</style>

<i18n lang="json">
{
  "en": {
    "record": {
      "title": "Record acceptance",
      "text": "Confirm that the user has read and accepted the current borrowing terms in the store.",
      "confirm": "Record acceptance"
    },
    "remove": {
      "title": "Remove acceptance",
      "text": "Remove the acceptance recorded in the store? The user then has to accept the borrowing terms again.",
      "confirm": "Remove acceptance"
    },
    "cancel": "Cancel",
    "error": "Something went wrong, please try again."
  },
  "de": {
    "record": {
      "title": "Akzeptanz erfassen",
      "text": "Bestätige, dass die Person die aktuellen Leihbedingungen vor Ort gelesen und akzeptiert hat.",
      "confirm": "Akzeptanz erfassen"
    },
    "remove": {
      "title": "Akzeptanz entfernen",
      "text": "Die vor Ort erfasste Akzeptanz entfernen? Die Person muss die Leihbedingungen dann erneut akzeptieren.",
      "confirm": "Akzeptanz entfernen"
    },
    "cancel": "Abbrechen",
    "error": "Etwas ist schiefgelaufen, bitte versuche es erneut."
  }
}
</i18n>
