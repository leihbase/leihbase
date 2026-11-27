<template>
  <Container width="lg" centered class="container">
    <PageAlert />
    <AdminOverviewNav />
    <AdminHeader subtitle="Admin" :title="t('title')" />

    <form method="POST" @submit.prevent="handleSubmit">
      <AdminSection
        :title="t('general.title')"
        :description="t('general.description')"
      >
        <Textarea
          :label="t('name.label')"
          :description="t('name.description')"
          name="name"
          :value="leihbase.name"
          :error="fieldError('name')"
          :rows="2"
          required
          data-testid="name-input"
          class="max-w"
        />
        <RichTextarea
          :label="t('description')"
          name="description"
          :value="leihbase.description"
          :error="fieldError('description')"
          class="max-w"
        />
      </AdminSection>

      <AdminSection
        :title="t('links.title')"
        :description="t('links.description')"
      >
        <Input
          :label="t('contact-link.label')"
          :description="t('contact-link.description')"
          name="contact_link"
          :value="leihbase.contact_link"
          :error="fieldError('contact_link')"
          placeholder="mailto:info@example.com"
          class="max-w"
        />
        <Input
          type="url"
          :label="t('privacy-policy-link.label')"
          :description="t('privacy-policy-link.description')"
          name="privacy_policy_link"
          :value="leihbase.privacy_policy_link"
          :error="fieldError('privacy_policy_link')"
          placeholder="https://example.com/privacy"
          class="max-w"
        />
      </AdminSection>

      <AdminSection
        :title="t('currency.title')"
        :description="t('currency.description')"
      >
        <Select :label="t('currency.label')" name="currency" :value="currency">
          <option v-for="code in currencies" :key="code" :value="code">
            {{ currencyLabel(code) }}
          </option>
        </Select>
      </AdminSection>

      <AdminSection
        :title="t('borrow-agreement.title')"
        :description="t('borrow-agreement.description')"
      >
        <BorrowAgreementEditor
          ref="borrowAgreementEditor"
          :borrow-agreement="borrowAgreement"
        />
      </AdminSection>

      <AdminSection>
        <Alert v-if="success" variant="success">{{ t("success") }}</Alert>
        <Alert
          v-if="errors.general || Object.keys(errors.fields).length"
          variant="error"
        >
          {{ t("error") }}
        </Alert>
        <div>
          <Button type="submit" :loading="loading">{{ t("save") }}</Button>
        </div>
      </AdminSection>
    </form>
  </Container>
</template>

<script setup lang="ts">
import { currencySymbol, DEFAULT_CURRENCY, SYMBOLS } from "@@/lib/currency";
import AdminHeader from "@/components/admin/AdminHeader.vue";
import AdminOverviewNav from "@/components/admin/AdminOverviewNav.vue";
import AdminSection from "@/components/admin/AdminSection.vue";
import BorrowAgreementEditor from "@/components/admin/BorrowAgreementEditor.vue";
import Alert from "@/components/core/Alert.vue";
import Button from "@/components/core/Button.vue";
import Container from "@/components/core/Container.vue";
import Input from "@/components/core/Input.vue";
import RichTextarea from "@/components/core/RichTextarea.vue";
import Select from "@/components/core/Select.vue";
import Textarea from "@/components/core/Textarea.vue";
import PageAlert from "@/components/page-alert/PageAlert.vue";
import type { BorrowAgreement } from "~~/models/borrowAgreement";

const { t } = useI18n({ useScope: "local" });
const { pb, isValid } = usePocketbase();
const userStore = useUserStore();
const leihbaseStore = useLeihbase();
const { leihbase } = storeToRefs(leihbaseStore);
const { loading, update, errors, fieldError } = usePocketbaseUpdate(
  pb,
  "leihbase"
);

if (!isValid.value) {
  // Not authenticated, first login
  await navigateTo({ path: "/login", query: { return: "/admin/settings" } });
} else if (!userStore.isAdmin) {
  throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
}

useHead({
  title: `${t("title")} | ${leihbase.value?.name}`,
});

const success = ref(false);

// Instance-wide borrowing terms, for locations without borrowing terms of their
// own
const { data: borrowAgreement } = await useAsyncData(
  "admin_instance_borrow_agreement",
  async () =>
    leihbase.value?.borrow_agreement
      ? await pb
          .collection("borrow_agreements")
          .getOne<BorrowAgreement>(leihbase.value.borrow_agreement)
      : null
);
const borrowAgreementEditor = ref<InstanceType<typeof BorrowAgreementEditor>>();
// Saved currency, the initial value of the currency select
const currency = leihbase.value?.currency || DEFAULT_CURRENCY;

// Listed currencies, and the saved one when set to an unlisted currency in the
// PocketBase admin interface
const codes = Object.keys(SYMBOLS);
const currencies = codes.includes(currency) ? codes : [...codes, currency];

/**
 * Label of a currency option, e.g. "EUR (€)" or "CHF"
 */
function currencyLabel(code: string) {
  const symbol = currencySymbol(code);
  return symbol === code ? code : `${code} (${symbol})`;
}

/**
 * Save the instance settings
 */
async function handleSubmit(e: SubmitEvent) {
  success.value = false;
  const formData = new FormData(e.target as HTMLFormElement);
  try {
    // Changed borrowing terms are saved as a new borrow agreement, unless saved
    // as a minor edit
    if (borrowAgreementEditor.value) {
      borrowAgreement.value = await borrowAgreementEditor.value.save();
    }
    formData.set("borrow_agreement", borrowAgreement.value?.id || "");
    await update(leihbase.value.id, formData);
    // Show the new settings across the app
    await leihbaseStore.fetch();
    success.value = true;
  } catch (e) {
    console.error(e);
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}
.max-w {
  max-width: 36rem;
}
</style>

<i18n lang="json">
{
  "en": {
    "title": "Instance settings",
    "general": {
      "title": "General",
      "description": "How the website is presented to visitors, the description is shown on the front page."
    },
    "name": {
      "label": "Name",
      "description": "Shown as the logo, use a line break to show it on multiple lines."
    },
    "description": "Description",
    "links": {
      "title": "Links",
      "description": "Links shown to visitors of all locations."
    },
    "contact-link": {
      "label": "Contact link",
      "description": "Shown in the footer, e.g. a contact page or a mailto: link."
    },
    "privacy-policy-link": {
      "label": "Privacy policy link",
      "description": "When set, users have to accept the privacy policy when signing up."
    },
    "currency": {
      "title": "Currency",
      "description": "Currency of deposits, for all locations, on the website and in emails.",
      "label": "Currency"
    },
    "borrow-agreement": {
      "title": "Borrowing terms",
      "description": "Borrowing terms of all locations, unless a location has borrowing terms of its own. Users accept them once, and again when they change. Leave empty to not use instance-wide borrowing terms."
    },
    "success": "Settings saved.",
    "error": "The settings could not be saved.",
    "save": "Save"
  },
  "de": {
    "title": "Instanz-Einstellungen",
    "general": {
      "title": "Allgemein",
      "description": "Wie die Website für Besucher dargestellt wird, die Beschreibung erscheint auf der Startseite."
    },
    "name": {
      "label": "Name",
      "description": "Wird als Logo angezeigt, mit einem Zeilenumbruch erscheint es auf mehreren Zeilen."
    },
    "description": "Beschreibung",
    "links": {
      "title": "Links",
      "description": "Links, die Besuchern aller Standorte angezeigt werden."
    },
    "contact-link": {
      "label": "Kontakt-Link",
      "description": "Wird in der Fußzeile angezeigt, z. B. eine Kontaktseite oder ein mailto:-Link."
    },
    "privacy-policy-link": {
      "label": "Link zur Datenschutzerklärung",
      "description": "Wenn gesetzt, müssen Nutzer die Datenschutzerklärung bei der Registrierung akzeptieren."
    },
    "currency": {
      "title": "Währung",
      "description": "Währung der Pfandbeträge, für alle Standorte, auf der Website und in E-Mails.",
      "label": "Währung"
    },
    "borrow-agreement": {
      "title": "Leihbedingungen",
      "description": "Leihbedingungen aller Standorte, außer ein Standort hat eigene Leihbedingungen. Nutzer akzeptieren sie einmalig, und erneut, wenn sie sich ändern. Leer lassen, um keine instanzweiten Leihbedingungen zu verwenden."
    },
    "success": "Einstellungen gespeichert.",
    "error": "Die Einstellungen konnten nicht gespeichert werden.",
    "save": "Speichern"
  }
}
</i18n>
