<template>
  <Dialog v-model:open="open" inset :title="title || ''">
    <template #header>
      <Input
        :id="`${id}-input`"
        placeholder="Enter search query..."
        class="input"
        v-model="query"
      />
    </template>
    <table v-if="documents && documents.length > 0" cellspacing="0">
      <tbody>
        <tr v-for="d in documents" :key="d.id">
          <td width="36">
            <Check v-if="selectedIds?.includes(d.id)" />
          </td>
          <td v-for="s in columns" @click="handleRecordClick(d)">
            {{ d[s] }}
          </td>
        </tr>
      </tbody>
    </table>
    <table v-else cellspacing="0">
      <tr>
        <td>{{ t("no_results") }}</td>
      </tr>
    </table>
  </Dialog>
</template>

<script lang="ts" setup>
import { Check } from "@iconoir/vue";
import type { RecordModel } from "pocketbase";
import Dialog from "../core/Dialog.vue";
import Input from "../core/Input.vue";

const { t } = useI18n({
  useScope: "local",
});

const props = defineProps<{
  id: string;
  collection: string;
  columns: string[];
  multiple: boolean;
  selected: RecordModel[] | null;
  title: string;
}>();

const open = defineModel<boolean>("open", { default: false });

const emit = defineEmits<{
  (e: "select", records: RecordModel[]): void;
}>();

const { pb } = usePocketbase();

// Search query
const query = ref("");

/**
 * Reset query when closing dialog
 */
watch(open, () => {
  if (!open.value) {
    query.value = "";
  }
});

const selectedIds = computed(() => {
  if (!props.selected) {
    return [];
  }
  return props.selected.map((s) => s.id);
});

/**
 * Fetches all documents for the current collection
 */
const { data: documents, refresh } = await useAsyncData(
  `record-picker-${props.id}-${props.collection}`,
  () => {
    if (!props.collection || !props.columns) {
      throw new Error(
        "[RecordPicker] no `collection` or `columns` parameter set"
      );
    }
    return pb.collection(props.collection).getFullList(
      query.value
        ? {
            filter: pb.filter(
              props.columns.map((s) => `${s} ~ {:query}`).join(" || "),
              {
                query: query.value,
              }
            ),
          }
        : {}
    );
  },
  { server: false, watch: [query] }
);

function handleRecordClick(_record: RecordModel) {
  // Multiple
  if (props.multiple) {
    let newSelected: RecordModel[];
    if (selectedIds.value.includes(_record.id)) {
      // If already active, remove
      newSelected = (props.selected || []).filter((s) => s.id !== _record.id);
    } else {
      // If not already active, add
      newSelected = [...(props.selected || []), _record];
    }
    emit("select", newSelected);
  } else {
    // Singular
    if (
      props.selected &&
      props.selected.length > 0 &&
      props.selected[0] &&
      props.selected[0].id === _record.id
    ) {
      // When clicking the active record, deselect it
      emit("select", []);
    } else {
      // Otherwise select it
      emit("select", [_record]);
    }
    open.value = false;
  }
}
</script>

<style scoped>
.input {
  margin-bottom: 1rem;
}
table {
  width: 100%;
  border-collapse: collapse;
}
table tr:hover {
  background-color: #f9f9f9;
  cursor: pointer;
}
table td {
  border: 1px solid #f3f3f3;
  padding: 0.25rem 0.5rem;
}
</style>

<i18n lang="json">
{
  "en": {
    "no_results": "No search results"
  },
  "de": {
    "no_results": "Keine Suchergebnisse"
  }
}
</i18n>
