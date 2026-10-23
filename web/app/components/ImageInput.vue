<template>
  <div class="root">
    <FormLabel :for="id" :required="required">{{ label }}</FormLabel>
    <div class="images">
      <!-- Existing images -->
      <div v-for="image in images" class="image">
        <img
          :src="`${config.public.pocketbase.clientBaseUrl}/api/files/products/${recordId}/${image}`"
        />
        <button
          class="remove"
          @click.prevent="images = images.filter((i) => i !== image)"
        >
          <Trash />
        </button>
      </div>

      <!-- New images -->
      <div v-for="image in newImages" class="image">
        <img :src="`${createObjectURL(image)}`" />
        <button
          class="remove"
          @click.prevent="newImages = newImages.filter((i) => i !== image)"
        >
          <Trash />
        </button>
      </div>

      <!-- Add image button -->
      <button class="add" @click.prevent="handleAdd">+</button>
    </div>

    <!-- Hidden input file -->
    <input ref="input" type="file" @change="handleAddFiles" multiple />

    <!-- Description -->
    <p v-if="description">
      <small>{{ description }}</small>
    </p>
  </div>
</template>

<script lang="ts" setup>
import { Trash } from "@iconoir/vue";
import { templateRef } from "@vueuse/core";
import FormLabel from "./core/FormLabel.vue";

const config = useRuntimeConfig();

const images = defineModel<string[]>("images", { default: () => [] });
const newImages = defineModel<File[]>("newImages", { default: () => [] });

defineProps<{
  recordId?: string;
  collection: string;
  id?: string;
  label?: string;
  required?: boolean;
  description?: string;
  dataTestid?: string;
}>();

const fileInput = templateRef<HTMLInputElement>("input");

/**
 * Trigger file input on click of 'add image' button
 */
async function handleAdd() {
  fileInput.value.click();
}

/**
 * Append newly selected files to newImages array
 */
function handleAddFiles() {
  const files = fileInput.value.files || [];
  newImages.value = [...newImages.value, ...files];
}

/**
 * Returns an object url for a file
 * @param file File to return an object url of
 */
function createObjectURL(file: File) {
  return URL.createObjectURL(file);
}
</script>

<style scoped>
.root {
  width: 100%;
}
.images {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.images .image {
  position: relative;
  width: calc((100% - (3 * 0.5rem)) / 4);
  max-width: 100%;
}
.images .image img {
  object-fit: cover;
  aspect-ratio: 1/1;
  border-radius: var(--border-radius);
  width: 100%;
}
.images .image button.remove {
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  z-index: 10;
  width: 1.5rem;
  height: 1.5rem;
  background: rgba(255, 255, 255, 0.5);
  border: 0;
  border-radius: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
}
button.add {
  width: calc((100% - (3 * 0.5rem)) / 4);
  aspect-ratio: 1/1;
  border-radius: var(--border-radius);
  border: 2px dashed var(--primary-color);
  cursor: pointer;
  background-color: var(--secondary-color);
  font-size: var(--font-size-lg);
}
button.add:hover {
  border: 2px solid var(--primary-color);
}
input {
  display: none;
}
p {
  margin: 0;
}
</style>
