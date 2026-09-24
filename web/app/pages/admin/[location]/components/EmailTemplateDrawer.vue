<template>
  <Drawer :headerOffset="false" inset v-model:open="open" size="md">
    <!-- Header -->
    <header>
      <Heading is="h2" size="lg">{{ editing ? t("edit") : t("new") }}</Heading>
      <div class="buttons">
        <Button v-if="editing" variant="secondary" circle @click="handleDelete">
          <Trash />
        </Button>
        <Button variant="secondary" circle @click="open = false">
          <Xmark />
        </Button>
      </div>
    </header>

    <form @submit.prevent="handleSubmit" class="lb-stack">
      <Select
        :label="t('template_type')"
        name="name"
        v-model="name"
        required
        :disabled="editing"
      >
        <option value="">
          {{ t("choose_a_template") }}
        </option>
        <option value="reservation_confirmation">
          {{ g("email_templates.reservation_confirmation") }}
        </option>
        <option value="reservation_confirmation_location">
          {{ g("email_templates.reservation_confirmation_location") }}
        </option>
        <option value="reservation_start_reminder">
          {{ g("email_templates.reservation_start_reminder") }}
        </option>
        <option value="reservation_end_reminder">
          {{ g("email_templates.reservation_end_reminder") }}
        </option>
        <option value="cancellation_confirmation">
          {{ g("email_templates.cancellation_confirmation") }}
        </option>
        <option value="reservation_cancellation_location">
          {{ g("email_templates.reservation_cancellation_location") }}
        </option>
      </Select>

      <Switch
        v-if="name"
        id="enabled"
        name="enabled"
        :label="t('enabled')"
        v-model="enabled"
      />

      <Input
        v-if="name"
        :label="t('subject')"
        name="subject"
        v-model="subject"
        required
      />

      <Textarea
        v-if="name"
        :label="t('html_body')"
        name="html"
        v-model="html"
        required
        :description="t('html_body_description', { variable: '{VARIABLE}' })"
        :disabled="fetchingTemplateSettings"
        :rows="12"
        code
      />

      <div v-if="name" class="template-variables">
        <Heading is="h3" size="sm">{{ t("available_variables") }}</Heading>
        <div class="variable-list">
          <Badge
            v-for="varName in templateVariables"
            :key="varName"
            variant="neutral"
          >
            {{ "{" + varName + "}" }}
          </Badge>
        </div>
      </div>

      <footer v-if="name">
        <Button :loading="loading" type="submit">{{ t("save") }}</Button>
        <Button variant="secondary" @click="handleCancel">{{
          t("cancel")
        }}</Button>
      </footer>
    </form>
  </Drawer>
</template>

<script setup lang="ts">
import type { EmailTemplate } from "@@/models/EmailTemplate";
import Badge from "@/components/core/Badge.vue";
import Button from "@/components/core/Button.vue";
import Drawer from "@/components/core/Drawer.vue";
import Heading from "@/components/core/Heading.vue";
import Input from "@/components/core/Input.vue";
import Select from "@/components/core/Select.vue";
import Switch from "@/components/core/Switch.vue";
import Textarea from "@/components/core/Textarea.vue";
import { Trash, Xmark } from "@iconoir/vue";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n({ useScope: "local" });
const { t: g } = useI18n({ useScope: "global" });

const props = defineProps<{
  location: any;
  template?: EmailTemplate;
}>();

const open = defineModel("open");

const emit = defineEmits(["saved", "deleted", "cancelled"]);

const loading = ref(false);
const deleting = ref(false);
const fetchingTemplateSettings = ref(false);

const name = ref("");
const subject = ref("");
const html = ref("");
const templateVariables = ref([]);
const enabled = ref(true);

const { pb } = usePocketbase();

const editing = computed(() => !!props.template);

watch(open, (isOpening) => {
  if (!isOpening) return;
  // error.value = null;
  enabled.value = props.template?.enabled || true;
  name.value = props.template?.name || "";
  subject.value = props.template?.subject || "";
  html.value = props.template?.html || "";
});

// Update template data when template type or locale changes (for new templates)
watch(name, async () => {
  const templateSettings = await fetchTemplateSettings();
  templateVariables.value = templateSettings?.variables;
  if (!props.template) {
    subject.value = templateSettings?.subject;
    html.value = templateSettings?.html;
  }
});

// Fetches template settings
async function fetchTemplateSettings() {
  fetchingTemplateSettings.value = true;
  try {
    const result = await pb.send(
      `/api/email-templates/defaults/${locale.value}/${name.value}`,
      {}
    );
    return {
      subject: result.template?.subject,
      html: result.template?.html,
      variables: result.vars || [],
    };
  } catch (error) {
    console.error("Failed to fetch default template:", error);
  } finally {
    fetchingTemplateSettings.value = false;
  }
}

async function handleSubmit() {
  loading.value = true;
  try {
    const data = {
      location: props.location.id,
      name: name.value,
      subject: subject.value,
      html: html.value,
      enabled: enabled.value,
      locale: locale.value,
    };

    let result;
    if (props.template) {
      result = await pb
        .collection("email_templates")
        .update(props.template.id, data);
    } else {
      result = await pb.collection("email_templates").create(data);
    }
    emit("saved", result);
    open.value = false;
  } finally {
    loading.value = false;
  }
}

async function handleDelete() {
  if (!props.template?.id) return;

  deleting.value = true;
  try {
    await pb.collection("email_templates").delete(props.template.id);
    emit("deleted");
  } finally {
    deleting.value = false;
    open.value = false;
  }
}

function handleCancel() {
  emit("cancelled");
}
</script>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: var(--fluid-spacing-4);
}
header .buttons {
  display: flex;
  gap: 1rem;
}

.variable-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.actions {
  display: flex;
  gap: 1rem;
  align-self: flex-start;
  margin-top: 1rem;
}

select {
  width: 100%;
}

.loading-default {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--secondary-text-color);
  font-size: 0.875rem;
  margin-top: -0.5rem;
  margin-bottom: 1rem;
}

footer {
  display: flex;
  gap: 1rem;
}
</style>

<i18n lang="json">
{
  "en": {
    "new": "New template",
    "edit": "Edit template",
    "template_type": "Template Type",
    "locale": "Locale",
    "subject": "Subject",
    "html_body": "HTML Body",
    "html_body_description": "Use {variable} for placeholders. Available variables are shown below.",
    "available_variables": "Available Variables",
    "enabled": "Enabled",
    "save": "Save",
    "delete": "Delete",
    "cancel": "Cancel",
    "loading_default_template": "Loading default template...",
    "choose_a_template": "Choose a template type",
    "reservation_confirmation": "Reservation Confirmation (User)",
    "reservation_confirmation_location": "Reservation Confirmation (Location)",
    "reservation_start_reminder": "Pickup Reminder",
    "reservation_end_reminder": "Return Reminder",
    "cancellation_confirmation": "Cancellation Confirmation (User)",
    "reservation_cancellation_location": "Cancellation Confirmation (Location)"
  },
  "de": {
    "new": "Neue Vorlage",
    "edit": "Vorlage bearbeiten",
    "template_type": "Vorlagen-Typ",
    "locale": "Sprache",
    "subject": "Betreff",
    "html_body": "HTML-Inhalt",
    "html_body_description": "Verwende {variable} für Platzhalter. Verfügbare Variablen werden unten angezeigt.",
    "available_variables": "Verfügbare Variablen",
    "enabled": "Aktiviert",
    "save": "Speichern",
    "delete": "Löschen",
    "cancel": "Abbrechen",
    "loading_default_template": "Lade Standard-Vorlage...",
    "choose_a_template": "Wähle einen Vorlagentyp"
  }
}
</i18n>
