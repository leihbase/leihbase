<template>
  <Container width="lg" centered>
    <PageAlert class="banner" />

    <AdminNav v-if="location" :location="location" />
    <AdminHeader v-if="location" :title="t('title')" :location="location" />

    <form v-if="location" method="POST" @submit.prevent="handleSubmit">
      <AdminSection
        :title="t('general')"
        :description="t('general_description')"
      >
        <Input
          :label="t('name')"
          name="name"
          :value="location.name"
          :error="errors.fields['name'] ? t(errors.fields['name']) : undefined"
          required
          class="max-w"
        />
        <Input
          :label="t('address')"
          name="address"
          :value="location.address"
          :error="
            errors.fields['address'] ? t(errors.fields['address']) : undefined
          "
          required
          class="max-w"
        />
        <RichTextarea
          :label="t('description')"
          name="description"
          :value="location.description"
          :error="
            errors.fields['description']
              ? t(errors.fields['description'])
              : undefined
          "
          class="max-w"
        />
      </AdminSection>

      <AdminSection
        :title="t('reservation-system')"
        :description="t('reservation-system_description')"
      >
        <div class="radios max-w">
          <RadioBox
            id="reservation-system-disabled"
            name="reservation_system"
            :title="t('disabled.title')"
            value="disabled"
            :checked="location.reservation_system === 'disabled'"
          >
            {{ t("disabled.text") }}
          </RadioBox>
          <RadioBox
            id="reservation-system-single"
            name="reservation_system"
            :title="t('single.title')"
            value="single"
            :checked="location.reservation_system === 'single'"
          >
            {{ t("single.text") }}
          </RadioBox>
          <RadioBox
            id="reservation-system-multiple"
            name="reservation_system"
            :title="t('multiple.title')"
            value="multiple"
            :checked="location.reservation_system === 'multiple'"
          >
            {{ t("multiple.text") }}
          </RadioBox>
        </div>

        <Input
          name="max_reservation_days"
          type="number"
          :label="t('max-reservation-days.label')"
          :description="t('max-reservation-days.description')"
          :value="location.max_reservation_days"
          :error="
            errors.fields['max_reservation_days']
              ? t(errors.fields['max_reservation_days'])
              : undefined
          "
          class="max-w"
        />
        <Input
          name="reservation_start_limit"
          type="number"
          :label="t('reservation-start-limit.label')"
          :description="t('reservation-start-limit.description')"
          :value="location.reservation_start_limit"
          :error="
            errors.fields['reservation_start_limit']
              ? t(errors.fields['reservation_start_limit'])
              : undefined
          "
          class="max-w"
        />

        <Switch
          id="allow-same-day-reservations"
          name="allow_same_day_reservations"
          :label="t('allow-same-day-reservations.label')"
          :description="t('allow-same-day-reservations.description')"
          :value="location.allow_same_day_reservations"
        />
      </AdminSection>

      <AdminSection
        :title="t('borrow-agreement.title')"
        :description="t('borrow-agreement.description')"
      >
        <RichTextarea
          :label="t('borrow-agreement.label')"
          name="borrow_agreement_content"
          :value="borrowAgreement?.content"
          :headings="[3, 4]"
          height="24rem"
          data-testid="borrow-agreement-input"
          class="max-w"
        />
        <Switch
          v-if="borrowAgreement"
          id="borrow-agreement-minor-edit"
          v-model="isBorrowAgreementMinorEdit"
          :label="t('borrow-agreement.minor-edit.label')"
          :description="t('borrow-agreement.minor-edit.description')"
          data-testid="borrow-agreement-minor-edit"
        />
      </AdminSection>

      <AdminSection
        :title="t('email_settings')"
        :description="t('email_settings_description')"
      >
        <Input
          :label="t('email')"
          name="email"
          :value="location.email"
          :error="
            errors.fields['email'] ? t(errors.fields['email']) : undefined
          "
          required
          autocomplete="off"
          class="max-w"
        />
        <div>
          <Link :to="`/admin/${location?.slug}/email-templates`">
            {{ t("manage_email_templates") }}
          </Link>
        </div>
      </AdminSection>

      <AdminSection>
        <Alert v-if="success" variant="success">
          {{ t("success") }}
        </Alert>
        <div>
          <Button type="submit" :loading="loading">
            {{ t("save") }}
          </Button>
        </div>
      </AdminSection>
    </form>
  </Container>
</template>

<script setup lang="ts">
import AdminSection from "@/components/admin/AdminSection.vue";
import Alert from "@/components/core/Alert.vue";
import Button from "@/components/core/Button.vue";
import Container from "@/components/core/Container.vue";
import Input from "@/components/core/Input.vue";
import Link from "@/components/core/Link.vue";
import RadioBox from "@/components/core/RadioBox.vue";
import RichTextarea from "@/components/core/RichTextarea.vue";
import Switch from "@/components/core/Switch.vue";
import PageAlert from "@/components/page-alert/PageAlert.vue";
import type { BorrowAgreement } from "~~/models/borrowAgreement";
import { ClientResponseError } from "pocketbase";
import AdminHeader from "./components/AdminHeader.vue";
import AdminNav from "./components/AdminNav.vue";

const { t } = useI18n({ useScope: "local" });
const route = useRoute();
const { pb } = usePocketbase();
const { loading, update, errors } = usePocketbaseUpdate(pb, "location");

const slug = route.params.location as string;
const success = ref(false);
const isBorrowAgreementMinorEdit = ref(false);

const location = await useLocation({
  slug,
});

if (!location.value || !location.value.id) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page Not Found",
  });
}

const { data: borrowAgreement } = await useAsyncData(
  "admin_location_borrow_agreement",
  async () =>
    location.value?.borrow_agreement
      ? await pb
          .collection("borrow_agreements")
          .getOne<BorrowAgreement>(location.value.borrow_agreement)
      : null
);

useHead({
  title: `${t("title")} | ${location.value.name}`,
});

/**
 * Saves the borrow agreement content. A minor edit updates the current borrow
 * agreement in place, otherwise a new borrow agreement is created, which users
 * have to accept again. Returns the id of the current borrow agreement.
 */
async function saveBorrowAgreement(content: string, isMinorEdit: boolean) {
  if (content === (borrowAgreement.value?.content || "")) {
    return borrowAgreement.value?.id || "";
  }
  if (!content) {
    borrowAgreement.value = null;
    return "";
  }
  if (isMinorEdit && borrowAgreement.value) {
    borrowAgreement.value = await pb
      .collection("borrow_agreements")
      .update<BorrowAgreement>(borrowAgreement.value.id, { content });
  } else {
    borrowAgreement.value = await pb
      .collection("borrow_agreements")
      .create<BorrowAgreement>({ location: location.value!.id, content });
  }
  return borrowAgreement.value.id;
}

/**
 * Save the admin settings
 */
async function handleSubmit(e: SubmitEvent) {
  // Get the form data
  const data = new FormData(e.target as HTMLFormElement);

  // Set 'allow_same_day_reservations' as boolean field explicitly to 'true' or 'false'
  data.set(
    "allow_same_day_reservations",
    data.get("allow_same_day_reservations") ? "true" : "false"
  );

  // First store the borrow_agreement (when changed), then send the id of the (new) borrow agreement along
  const borrowAgreementContent = (data.get("borrow_agreement_content") ||
    "") as string;
  data.delete("borrow_agreement_content");
  try {
    data.set(
      "borrow_agreement",
      await saveBorrowAgreement(
        borrowAgreementContent,
        isBorrowAgreementMinorEdit.value
      )
    );
    isBorrowAgreementMinorEdit.value = false;
    location.value = await update(location.value!.id, data);
    success.value = true;
  } catch (e) {
    if (e instanceof ClientResponseError) {
      console.log(e.response);
    }
  }
}
</script>

<style scoped>
.max-w {
  max-width: 36rem;
}
.radios {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}
</style>

<i18n lang="json">
{
  "en": {
    "title": "Settings",
    "general": "General",
    "general_description": "How the location is presented to visitors.",
    "name": "Name",
    "address": "Address",
    "email": "Email address",
    "description": "Description",
    "reservation-system": "Reservations",
    "reservation-system_description": "How and when items of this location can be reserved.",
    "disabled": {
      "title": "Disabled",
      "text": "The reservation system is disabled. Only admin users can create reservations."
    },
    "single": {
      "title": "Single",
      "text": "One reservation per product. A product is unavailable, and can't be reserved, as long as an unclosed reservation exists."
    },
    "multiple": {
      "title": "Multiple",
      "text": "Multiple reservations per product for different time periods. A product is unavailable during active reservations or when no new reservation can be placed before the next one."
    },
    "max-reservation-days": {
      "label": "Maximum reservation duration",
      "description": "Maximum duration of reservation in days."
    },
    "reservation-start-limit": {
      "label": "Maximum reservation start days",
      "description": "Furthest in advance a reservation can begin, in days (0=endless)."
    },
    "allow-same-day-reservations": {
      "label": "Same day reservations",
      "description": "Allow a new reservation to start on the same day as the previous reservation ends"
    },
    "borrow-agreement": {
      "title": "Borrowing terms",
      "description": "Users have to accept the borrowing terms before their first reservation at this location. Leave empty to not require borrowing terms.",
      "label": "Borrowing terms",
      "minor-edit": {
        "label": "Minor edit",
        "description": "Users who accepted the borrowing terms don't have to accept them again. Only use this for small corrections, like typos. Without this, all users have to accept the changed borrowing terms."
      }
    },
    "email_settings": "Email",
    "email_settings_description": "Contact address of the location, and the emails sent to borrowers.",
    "manage_email_templates": "Configure email templates",
    "success": "Settings saved.",
    "save": "Save"
  },
  "de": {
    "title": "Einstellungen",
    "general": "Allgemein",
    "general_description": "Wie der Standort für Besucher dargestellt wird.",
    "name": "Name",
    "address": "Adresse",
    "email": "E-Mail-Adresse",
    "description": "Beschreibung",
    "reservation-system": "Reservierungen",
    "reservation-system_description": "Wie und wann Gegenstände dieses Standorts reserviert werden können.",
    "disabled": {
      "title": "Deaktiviert",
      "text": "Das Reservierungssystem ist deaktiviert. Nur Administratoren können Reservierungen vornehmen."
    },
    "single": {
      "title": "Einzeln",
      "text": "Eine Reservierung pro Produkt. Ein Produkt ist nicht verfügbar, und kann nicht reserviert werden, solange eine offene Reservierung besteht."
    },
    "multiple": {
      "title": "Mehrfach",
      "text": "Mehrere Reservierungen pro Produkt für verschiedene Zeiträume. Das Produkt ist während aktiver Reservierungen oder wenn vor der nächsten Reservierung keine neue mehr möglich ist, nicht verfügbar."
    },
    "max-reservation-days": {
      "label": "Maximale Reservierungsdauer",
      "description": "Maximale Dauer der Reservierung in Tagen."
    },
    "reservation-start-limit": {
      "label": "Maximale Reservierungsstarttage",
      "description": "Maximale Vorlaufzeit in Tage für den Beginn einer Reservierung (0=unbegrenzt)."
    },
    "allow-same-day-reservations": {
      "label": "Reservierungen am selben Tag",
      "description": "Ermöglicht den Beginn einer neuen Reservierung am selben Tag, an dem die vorherige Reservierung endet."
    },
    "borrow-agreement": {
      "title": "Leihbedingungen",
      "description": "Nutzer müssen die Leihbedingungen vor ihrer ersten Reservierung an diesem Standort akzeptieren. Leer lassen, um keine Leihbedingungen zu verlangen.",
      "label": "Leihbedingungen",
      "minor-edit": {
        "label": "Kleine Änderung",
        "description": "Nutzer, die die Leihbedingungen akzeptiert haben, müssen sie nicht erneut akzeptieren. Nur für kleine Korrekturen wie Tippfehler verwenden. Ohne diese Option müssen alle Nutzer die geänderten Leihbedingungen erneut akzeptieren."
      }
    },
    "email_settings": "E-Mail",
    "email_settings_description": "Kontaktadresse des Standorts und die E-Mails an Ausleihende.",
    "manage_email_templates": "E-Mail Vorlage verwalten",
    "success": "Einstellungen gespeichert.",
    "save": "Speichern"
  }
}
</i18n>
