<template>
  <div :style="{ height }">
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
defineProps<{ height: string }>();
</script>

<style scoped>
div {
  overflow-y: auto;
}
</style>
