<template>
  <Container width="lg" centered>
    <PageAlert class="banner" />

    <AdminNav v-if="location" :location="location" />
    <AdminHeader v-if="location" :title="t('title')" :location="location">
      <Button @click="handleNewTemplate">
        {{ t("new_template") }}
      </Button>
    </AdminHeader>

    <div v-if="fetchStatus === 'pending'" class="loading">
      <LoadingSpinner />
    </div>

    <div v-else class="lb-stack">
      <Alert v-if="success" variant="success">
        {{ t("success") }}
      </Alert>

      <div v-if="!templates || templates.length === 0" class="empty-state">
        <p>{{ t("no_templates") }}</p>
        <p>{{ t("no_templates_description") }}</p>
      </div>

      <div class="templates-grid">
        <Card
          v-for="template in templates"
          :key="template.id"
          class="template-card"
          :padding="false"
        >
          <div class="template-header">
            <strong>{{ g(`email_templates.${template.name}`) }}</strong>
            <Badge v-if="template.enabled" variant="success">
              {{ t("enabled") }}
            </Badge>
            <Badge v-else variant="error">{{ t("disabled") }}</Badge>
          </div>
          <div class="template-content">
            <p>
              <strong>{{ t("subject") }}:</strong> {{ template.subject }}
            </p>
          </div>
          <Button size="sm" @click="handleEdit(template)" variant="secondary">
            {{ t("edit") }}
          </Button>
        </Card>
      </div>

      <EmailTemplateDrawer
        v-if="location"
        v-model:open="emailTemplateDrawerOpen"
        :location="location"
        :template="editingTemplate"
        @saved="handleTemplateSaved"
        @deleted="handleTemplateDeleted"
        @cancelled="handleEditorCancelled"
      />
    </div>
  </Container>
</template>

<script setup lang="ts">
import type { EmailTemplate } from "@@/models/EmailTemplate";
import Alert from "@/components/core/Alert.vue";
import Badge from "@/components/core/Badge.vue";
import Button from "@/components/core/Button.vue";
import Card from "@/components/core/Card.vue";
import Container from "@/components/core/Container.vue";
import LoadingSpinner from "@/components/core/LoadingSpinner.vue";
import PageAlert from "@/components/page-alert/PageAlert.vue";
import { useI18n } from "vue-i18n";
import AdminHeader from "./components/AdminHeader.vue";
import AdminNav from "./components/AdminNav.vue";
import EmailTemplateDrawer from "./components/EmailTemplateDrawer.vue";

const route = useRoute();
const { t } = useI18n({ useScope: "local" });
const { t: g } = useI18n({ useScope: "global" });
const { pb } = usePocketbase();

const slug = Array.isArray(route.params.location)
  ? route.params.location[0]
  : route.params.location;

if (!slug) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page Not Found",
  });
}

const location = await useLocation({
  slug,
});

if (!location.value || !location.value.id) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page Not Found",
  });
}

const emailTemplateDrawerOpen = ref(false);
const success = ref(false);
const editingTemplate = ref<EmailTemplate>();

const {
  data: templates,
  refresh,
  status: fetchStatus,
} = useAsyncData<EmailTemplate[]>(() =>
  pb.collection("email_templates").getFullList({
    filter: pb.filter("location = {:location}", {
      location: location.value!.id,
    }),
    sort: "name,locale",
  })
);

function handleNewTemplate() {
  editingTemplate.value = undefined;
  emailTemplateDrawerOpen.value = true;
}

function handleEdit(template: any) {
  editingTemplate.value = { ...template };
  emailTemplateDrawerOpen.value = true;
}

function handleTemplateSaved(savedTemplate: any) {
  success.value = true;
  editingTemplate.value = undefined;
  refresh();

  // Hide success message after 3 seconds
  setTimeout(() => {
    success.value = false;
  }, 3000);
}

function handleTemplateDeleted() {
  success.value = true;
  editingTemplate.value = undefined;
  refresh();

  setTimeout(() => {
    success.value = false;
  }, 3000);
}

function handleEditorCancelled() {
  editingTemplate.value = undefined;
}

// Watch for location changes
watch(
  () => location,
  () => {
    refresh();
  }
);
</script>

<style scoped>
.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1rem;
}

.template-card {
  padding: var(--fluid-spacing-4);
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.template-content {
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--secondary-text-color);
}

.loading {
  display: flex;
  justify-content: center;
  padding: 2rem;
}
</style>

<i18n lang="json">
{
  "en": {
    "title": "Email Templates",
    "email_templates": "Email Templates",
    "new_template": "New Template",
    "subject": "Subject",
    "enabled": "Enabled",
    "disabled": "Disabled",
    "edit": "Edit",
    "success": "Changes saved successfully.",
    "no_templates": "No custom email templates",
    "no_templates_description": "Create custom templates to override the default emails for this location."
  },
  "de": {
    "title": "E-Mail-Vorlagen",
    "email_templates": "E-Mail-Vorlagen",
    "new_template": "Neue Vorlage",
    "subject": "Betreff",
    "enabled": "Aktiviert",
    "disabled": "Deaktiviert",
    "edit": "Bearbeiten",
    "success": "Änderungen erfolgreich gespeichert.",
    "no_templates": "Keine benutzerdefinierten E-Mail-Vorlagen",
    "no_templates_description": "Erstelle benutzerdefinierte Vorlagen, um die Standard-E-Mails für diesen Standort zu überschreiben."
  }
}
</i18n>
