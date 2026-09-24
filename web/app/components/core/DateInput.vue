<template>
  <div class="root">
    <FormLabel :for="id" :required="required">
      {{ label }}<template #suffix><slot name="label-suffix" /></template>
    </FormLabel>
    <Popup v-model:open="showPopup">
      <input
        :id="id"
        :name="name"
        :required="required"
        :value="model ? formatDate(model, 'DD.MM.YYYY', locale) : ''"
        class="lb-input"
        :data-testid="dataTestid"
        :aria-describedby="description ? `${id}-description` : undefined"
        @click="handleInputFocus"
      />
      <template #popup>
        <ClientOnly>
          <calendar-date
            :key="id + popoutKey + key"
            ref="datepicker"
            :show-outside-days="showOutsideDays"
            :isDateDisallowed="isDateDisallowed"
            :locale="locale"
            :data-testid="`${dataTestid}-calendar`"
            @change="handleDateChange"
          >
            <ArrowLeft slot="previous" :title="t('previous_month')" />
            <ArrowRight slot="next" :title="t('next_month')" />
            <calendar-month></calendar-month>
          </calendar-date>
        </ClientOnly>
      </template>
    </Popup>
    <p v-if="description" :id="`${id}-description`" class="description">
      <small>{{ description }}</small>
    </p>
  </div>
</template>

<script lang="ts" setup>
import { formatDate, toShortISO } from "@@/lib/date";
import { ArrowLeft, ArrowRight } from "@iconoir/vue";
import FormLabel from "./FormLabel.vue";
import Popup from "./Popup.vue";

const { t, locale } = useI18n();

const model = defineModel<Date>();
const emit = defineEmits<{ input: [Date] }>();
const props = withDefaults(
  defineProps<{
    id?: string;
    label: string;
    name?: string;
    required?: boolean;
    isDateDisallowed?: Function;
    showOutsideDays?: boolean;
    dataTestid?: string;
    description?: string;
    popoutKey?: string;
  }>(),
  { showOutsideDays: true, popoutKey: "" }
);

const id = props.id || useId();
const key = ref(0);
const datepicker = ref();
const showPopup = ref(false);

watch(model, (value) => {
  if (value) {
    datepicker.value.value = toShortISO(value);
  } else {
    // Reset datepicker value when module value got reset
    datepicker.value.value = "";
    // Force rerender of cally calendar-date, so that initial month view gets reset
    key.value++;
  }
});

function handleInputFocus() {
  showPopup.value = true;
}

function handleDateChange() {
  model.value = new Date(datepicker.value.value);
  showPopup.value = false;
  emit("input", model.value);
}

if (import.meta.client) {
  await import("cally");
}
</script>

<style scoped>
.root {
  width: 100%;
}
label {
  display: block;
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-2);
}
.description {
  color: var(--input-description-color, #666);
  margin: 0;
}
p {
  margin: 0;
}
calendar-date::part(previous),
calendar-date::part(next) {
  background: transparent;
  border: 0;
}
calendar-month::part(day) {
  inline-size: 2rem;
  block-size: 2rem;
}
calendar-month::part(today) {
  border: 1px solid black;
}
calendar-month::part(disallowed) {
  text-decoration: line-through;
  opacity: 0.333;
}
calendar-month::part(outside) {
  cursor: pointer;
}
</style>

<i18n lang="json">
{
  "en": {
    "next_month": "Next month",
    "previous_month": "Previous month"
  },
  "de": {
    "next_month": "Nächster Monat",
    "previous_month": "Voriger Monat"
  }
}
</i18n>
