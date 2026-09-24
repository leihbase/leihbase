<template>
  <div class="root">
    <FormLabel v-if="label" :for="id" :required="required">
      {{ label }}<template #suffix><slot name="label-suffix" /></template>
    </FormLabel>
    <div class="wrapper">
      <div v-if="!!$slots.prefix" class="prefix">
        <slot name="prefix"></slot>
      </div>
      <input
        :type="type"
        :id="id"
        :name="name"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :readonly="readonly"
        :data-testid="dataTestid"
        :aria-invalid="!!error"
        :aria-describedby="
          [
            error ? `${id}-error` : null,
            description ? `${id}-description` : null,
          ]
            .filter((v) => !!v)
            .join(' ')
        "
        :autocomplete="autocomplete"
        v-model="model"
        :class="{ 'lb-input': true, 'has-prefix': !!$slots.prefix }"
        @blur="$emit('blur')"
      />
    </div>
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

const emits = defineEmits(["blur"]);
const model = defineModel();
const props = defineProps<{
  id?: string;
  label?: string;
  name?: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  type?: string;
  description?: string;
  error?: string;
  autocomplete?: string;
  dataTestid?: string;
}>();
if (props.value) {
  model.value = props.value;
}
const id = props.id || useId();
</script>

<style scoped>
.root {
  width: 100%;
}
.wrapper {
  display: flex;
  align-items: center;
  width: 100%;
}
.prefix {
  display: block;
  line-height: 2;
  padding: 0 var(--spacing-2);
  border: 1px solid var(--input-border-color);
  border-radius: var(--input-border-radius) 0 0 var(--input-border-radius);
  border-right: 0;
  padding: var(--spacing-1) var(--spacing-3);
  background-color: var(--input-disabled-background-color);
}
.lb-input.has-prefix {
  border-radius: 0 var(--input-border-radius) var(--input-border-radius) 0;
}
.error {
  color: #d55136;
}
p {
  margin: 0;
}
</style>
