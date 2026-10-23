<template>
  <div :id="id" class="popup-component">
    <slot></slot>
    <div v-show="open" class="popup">
      <slot name="popup"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
const open = defineModel<boolean>("open", { default: false });
const id = useId();

function close(e: Event) {
  const target = e.target as HTMLInputElement;
  const popup = target.closest(`#${id}`);
  if (!popup) {
    open.value = false;
  }
}

watch(open, (isOpening) => {
  if (isOpening) {
    document.addEventListener("click", close);
  } else {
    document.removeEventListener("click", close);
  }
});
</script>

<style scoped>
.popup-component {
  position: relative;
}
.popup {
  position: absolute;
  top: calc(100% + 4px);
  padding: 0.75rem;
  border: 1px solid #ccc;
  background-color: white;
  z-index: 90;
}
</style>
