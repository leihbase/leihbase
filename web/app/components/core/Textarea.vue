<template>
  <div class="root">
    <FormLabel :for="id" :required="required">
      {{ label }}<template #suffix><slot name="label-suffix" /></template>
    </FormLabel>
    <textarea
      :id="id"
      :name="name"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :readonly="readonly"
      :data-testid="dataTestid"
      v-model="model"
      :rows="rows"
      :aria-invalid="!!error"
      :aria-describedby="
        [error ? `${id}-error` : null, description ? `${id}-description` : null]
          .filter((v) => !!v)
          .join(' ')
      "
      :class="['lb-input', code ? 'code' : '']"
    ></textarea>
    <p v-if="error" :id="`${id}-error`" class="error">
      <small>{{ error }}</small>
    </p>
    <p v-if="description" :id="`${id}-description`" class="descrption">
      <small>{{ description }}</small>
    </p>
  </div>
</template>

<script lang="ts" setup>
import FormLabel from "./FormLabel.vue";

const model = defineModel();
const props = withDefaults(
  defineProps<{
    id?: string;
    label?: string;
    name?: string;
    value?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    error?: string;
    rows?: number;
    description?: string;
    dataTestid?: string;
    code?: boolean;
  }>(),
  { rows: 3 }
);
if (props.value) {
  model.value = props.value;
}
const id = props.id || useId();
</script>

<style scoped>
.root {
  width: 100%;
}
.lb-input {
  line-height: 1.15;
  padding: var(--spacing-3) var(--spacing-3);
}
.code {
  font-family: "Courier New", Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
}
</style>
