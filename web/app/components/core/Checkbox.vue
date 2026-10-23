<template>
  <fieldset class="checkbox">
    <input
      type="checkbox"
      :id="id"
      :name="name"
      :value="value"
      :required="required"
      :disabled="disabled"
      :data-testid="dataTestid"
      v-model="model"
    />
    <label :for="id"><slot /></label>
  </fieldset>
</template>

<script lang="ts" setup>
const model = defineModel<boolean>({ default: false });
defineProps<{
  id: string;
  name?: string;
  /** Value submitted with the form when checked */
  value?: string;
  required?: boolean;
  disabled?: boolean;
  dataTestid?: string;
}>();
</script>

<style scoped>
.checkbox {
  border: 0;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}
input {
  margin-top: 0.25rem;
}
</style>
