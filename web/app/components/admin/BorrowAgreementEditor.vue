<!--
  Editor of borrowing terms, of a location or of the instance. Saving creates a
  new borrow agreement, which users have to accept again, unless saved as a
  minor edit.
-->

<template>
  <RichTextarea
    :label="t('label')"
    v-model="content"
    :headings="[3, 4]"
    height="24rem"
    data-testid="borrow-agreement-input"
    class="max-w"
  />
  <Switch
    v-if="borrowAgreement && content && isEdited"
    id="borrow-agreement-minor-edit"
    v-model="isMinorEdit"
    :label="t('minor-edit.label')"
    :description="t('minor-edit.description')"
    data-testid="borrow-agreement-minor-edit"
  />
</template>

<script setup lang="ts">
import RichTextarea from "@/components/core/RichTextarea.vue";
import Switch from "@/components/core/Switch.vue";
import type { BorrowAgreement } from "~~/models/borrowAgreement";

const props = defineProps<{
  /** The current borrow agreement, if any */
  borrowAgreement: BorrowAgreement | null | undefined;
  /** Location of new borrow agreements, empty for the instance */
  location?: string;
}>();

const { t } = useI18n({ useScope: "local" });
const { pb } = usePocketbase();

const content = ref<string | undefined>(props.borrowAgreement?.content);
// If the content has been edited since loading or saving, even when it ended
// up the same
const isEdited = ref(false);
watch(content, () => {
  isEdited.value = true;
});
const isMinorEdit = ref(false);

/**
 * Saves the content. A minor edit updates the current borrow agreement in
 * place, otherwise a new borrow agreement is created, which users have to
 * accept again. Returns the current borrow agreement, `null` when emptied.
 */
async function save(): Promise<BorrowAgreement | null> {
  const current = props.borrowAgreement || null;
  const newContent = content.value || "";
  let saved = current;
  if (newContent === (current?.content || "")) {
    saved = current;
  } else if (!newContent) {
    saved = null;
  } else if (isMinorEdit.value && current) {
    saved = await pb
      .collection("borrow_agreements")
      .update<BorrowAgreement>(current.id, { content: newContent });
  } else {
    saved = await pb.collection("borrow_agreements").create<BorrowAgreement>({
      location: props.location || "",
      content: newContent,
    });
  }
  isMinorEdit.value = false;
  isEdited.value = false;
  return saved;
}

defineExpose({
  save,
  /** If there is content, so borrowing terms will be used */
  hasContent: computed(() => !!content.value),
});
</script>

<style scoped>
.max-w {
  max-width: 36rem;
}
</style>

<i18n lang="json">
{
  "en": {
    "label": "Borrowing terms",
    "minor-edit": {
      "label": "Minor edit",
      "description": "Users who accepted the borrowing terms don't have to accept them again. Only use this for small corrections, like typos. Without this, all users have to accept the changed borrowing terms."
    }
  },
  "de": {
    "label": "Leihbedingungen",
    "minor-edit": {
      "label": "Kleine Änderung",
      "description": "Nutzer, die die Leihbedingungen akzeptiert haben, müssen sie nicht erneut akzeptieren. Nur für kleine Korrekturen wie Tippfehler verwenden. Ohne diese Option müssen alle Nutzer die geänderten Leihbedingungen erneut akzeptieren."
    }
  }
}
</i18n>
