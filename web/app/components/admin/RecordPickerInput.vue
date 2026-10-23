<template>
  <div class="root">
    <FormLabel :for="id" :required="required">{{ label }}</FormLabel>
    <div class="row">
      <input
        type="text"
        :id="id"
        :name="name"
        :value="value"
        :placeholder="placeholder"
        :required="required"
        :data-testid="dataTestid"
        :class="{ 'lb-input': true }"
      />
      <button @click.prevent="showRecordPicker = true">
        {{ t("select") }}
      </button>
    </div>
    <p v-if="description">
      <small>{{ description }}</small>
    </p>
  </div>

  <Teleport to="body">
    <RecordPicker
      :id="`${id}-record-picker`"
      v-model:open="showRecordPicker"
      :collection="collection"
      :columns="columns"
      :multiple="multiple || false"
      :selected="records"
      :title="label"
      @select="handleSelect"
    />
  </Teleport>
</template>

<script lang="ts" setup generic="Multiple extends boolean = false">
import { equalValues } from "@@/lib/array";
import type { RecordModel } from "pocketbase";
import FormLabel from "../core/FormLabel.vue";
import RecordPicker from "./RecordPicker.vue";

const { t } = useI18n({
  useScope: "local",
});

const { pb } = usePocketbase();

/**
 * Model value is an array of ids when `multiple` is set, otherwise a single id
 */
type ModelValue = Multiple extends true ? string[] : string;

const model = defineModel<ModelValue>();
const props = defineProps<{
  id: string;
  label: string;
  collection: string;
  columns: [string, ...string[]];
  name?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  dataTestid?: string;
  multiple?: Multiple;
  description?: string;
}>();

const showRecordPicker = ref(false);
const records = ref<RecordModel[] | null>(null);
const isLoading = ref(false);

const value = computed(() => {
  if (!records.value || records.value.length === 0 || !records.value[0]) {
    return undefined;
  }
  if (props.multiple) {
    return records.value.map((r) => r[props.columns[0]]).join(", ");
  }
  return records.value[0][props.columns[0]];
});

const placeholder = computed(() => {
  if (isLoading.value) {
    return t("loading");
  }
  return t("none");
});

/**
 * On input value change, decide if displayed value should be refetched
 */
watch(model, (newModelValue) => {
  const active = (records.value || []).map((record) => record.id);
  if (!newModelValue) {
    records.value = [];
    return;
  }
  if (typeof newModelValue === "string" && active.includes(newModelValue)) {
    return;
  }
  if (
    Array.isArray(newModelValue) &&
    equalValues(active, newModelValue || [])
  ) {
    return;
  }
  refresh();
});

/**
 * Refetches active entries, to render readable values in the input
 */
async function refresh() {
  if (!model.value) {
    isLoading.value = false;
    return;
  }
  isLoading.value = true;
  records.value = await pb.collection(props.collection).getFullList({
    filter: pb.filter(`{:ids} ~ id`, { ids: model.value }),
  });
  isLoading.value = false;
}

/**
 * Update model based on selected records in the RecordPicker
 */
function handleSelect(selectedRecords: RecordModel[]) {
  records.value = selectedRecords;

  // No value
  if (!selectedRecords || selectedRecords.length === 0 || !selectedRecords[0]) {
    model.value = (props.multiple ? [] : "") as ModelValue;
    return;
  }

  // Map records to ids/id
  model.value = (
    props.multiple ? selectedRecords.map((r) => r.id) : selectedRecords[0].id
  ) as ModelValue;
}
</script>

<style lang="scss" scoped>
.root {
  width: 100%;
}
.row {
  display: flex;
  border: 1px solid var(--input-border-color);
  border-radius: var(--input-border-radius);
}
input {
  border: 0;
  color: var(--text-color);
  pointer-events: none;
}
button {
  border-radius: 0 var(--input-border-radius) var(--input-border-radius) 0;
  background-color: var(--secondary-color);
  color: var(--secondary-text-color);
  border: 1px solid transparent;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  &:hover {
    border: 2px solid var(--primary-color);
    margin: -1px -1px -1px 0;
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "loading": "Loading...",
    "select": "Select",
    "none": "None"
  },
  "de": {
    "loading": "Laden...",
    "select": "Auswählen",
    "none": "Keine"
  }
}
</i18n>
