<template>
  <Dialog v-model:open="open" :title="t('email_preview')" inset size="md">
    <div class="preview-content">
      <div v-if="loading" class="preview-loading">
        {{ t("loading") }}
      </div>
      <template v-else>
        <div class="preview-subject">{{ renderedSubject }}</div>
        <div class="preview-html" v-html="renderedHtml"></div>
      </template>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from "@/components/core/Dialog.vue";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n({ useScope: "local" });

const open = defineModel<boolean>("open");

const props = defineProps<{
  subject: string;
  html: string;
  templateName: string;
}>();

const { pb } = usePocketbase();

const loading = ref(false);
const renderedSubject = ref("");
const renderedHtml = ref("");

watch(open, async (isOpen) => {
  if (isOpen) {
    await fetchPreview();
  }
});

async function fetchPreview() {
  if (!props.templateName || !locale.value) return;

  loading.value = true;
  try {
    const params = new URLSearchParams({
      templateName: props.templateName,
      locale: locale.value,
      customSubject: props.subject,
      customHtml: props.html,
    });

    const result = await pb.send(
      `/api/email-templates/preview?${params.toString()}`,
      {}
    );

    renderedSubject.value = result.subject || "";
    renderedHtml.value = result.html || "";
  } catch (error) {
    console.error("Failed to fetch preview:", error);
    renderedSubject.value = props.subject;
    renderedHtml.value = props.html;
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.preview-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: white;
}

.preview-loading {
  padding: 1rem;
  text-align: center;
  color: var(--secondary-text-color);
}

.preview-subject {
  font-weight: bold;
}

.preview-html {
  background: white;
  min-height: 200px;
}

.preview-html :deep(img) {
  max-width: 100%;
}
</style>

<i18n lang="json">
{
  "en": {
    "email_preview": "Email Preview",
    "loading": "Loading..."
  },
  "de": {
    "email_preview": "E-Mail Vorschau",
    "loading": "Wird geladen..."
  }
}
</i18n>
