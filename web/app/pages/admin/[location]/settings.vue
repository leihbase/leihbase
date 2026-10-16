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
import { ClientResponseError } from "pocketbase";
import AdminHeader from "./components/AdminHeader.vue";
import AdminNav from "./components/AdminNav.vue";

const { t } = useI18n({ useScope: "local" });
const route = useRoute();
const { pb } = usePocketbase();
const { loading, update, errors } = usePocketbaseUpdate(pb, "location");

const slug = route.params.location;
const success = ref(false);

const location = await useLocation({
  slug: Array.isArray(slug) ? slug[0] : slug,
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

async function handleSubmit(e: SubmitEvent) {
  const data = new FormData(e.target as HTMLFormElement);
  data.set(
    "allow_same_day_reservations",
    data.get("allow_same_day_reservations") ? "true" : "false"
  );
  try {
    await update(location.value!.id, data);
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
    "email_settings": "E-Mail",
    "email_settings_description": "Kontaktadresse des Standorts und die E-Mails an Ausleihende.",
    "manage_email_templates": "E-Mail Vorlage verwalten",
    "success": "Einstellungen gespeichert.",
    "save": "Speichern"
  }
}
</i18n>
