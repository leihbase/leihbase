<template>
  <div class="root">
    <FormLabel :for="id" :required="required">
      {{ label }}<template #suffix><slot name="label-suffix" /></template>
    </FormLabel>
    <div class="textarea">
      <ClientOnly>
        <QuillEditor
          ref="editor"
          theme="snow"
          v-model:content="model"
          contentType="html"
          :toolbar="[
            ['bold', 'italic', 'underline', 'strike', 'link'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['clean'],
          ]"
        />
      </ClientOnly>
    </div>
    <p v-if="error" :id="`${id}-error`" class="error">
      <small>{{ error }}</small>
    </p>
    <textarea :name="name" class="hidden" v-model="model"></textarea>
  </div>
</template>

<script lang="ts" setup>
import { QuillEditor } from "@vueup/vue-quill";
import FormLabel from "./FormLabel.vue";
import "@vueup/vue-quill/dist/vue-quill.snow.css";

const editor = ref();
const model = defineModel<string>();
const props = defineProps<{
  id?: string;
  label?: string;
  name?: string;
  value?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  dataTestid?: string;
}>();

if (props.value) {
  model.value = props.value;
}

watch(model, (newValue) => {
  // Make sure editor is empty when model has no value
  if (!newValue) {
    editor.value.setHTML("");
    return;
  }

  // Reset model value to empty string when editor has empty-html structure
  // ex. `<div><p></p></div>`
  const el = document.createElement("div");
  el.innerHTML = newValue;
  if (!el.innerText) {
    model.value = "";
  }
});
</script>

<style scoped>
.root {
  width: 100%;
}
.lb-input {
  line-height: 1.15;
  padding: var(--spacing-3) var(--spacing-3);
}
.textarea {
  height: 10rem;
  display: flex;
  flex-direction: column;
  background-color: var(--input-background-color);
}
</style>

<style>
.ql-container {
  overflow: hidden;
  font-size: 1rem !important;
}
.ql-editor > ul,
.ql-editor > ol {
  padding-left: 0 !important;
}
</style>
