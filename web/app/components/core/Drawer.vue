<template>
  <div
    :class="{ overlay: true, open, 'header-offset': headerOffset }"
    @click="close"
  ></div>
  <div
    ref="sidebar"
    data-base-theme
    :class="{
      sidebar: true,
      open,
      'header-offset': headerOffset,
      inset,
      ['size-' + size]: true,
    }"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{ headerOffset: boolean; inset: boolean; size?: "sm" | "md" }>(),
  { size: "sm" }
);

const open = defineModel("open");
const sidebar = ref<HTMLDivElement>();
const bodyClass = ref("");

useHead({
  bodyAttrs: {
    class: bodyClass,
  },
});

watch(open, (isOpening) => {
  if (isOpening) {
    if (sidebar.value) {
      sidebar.value.scrollTop = 0;
    }
    bodyClass.value = "overflow-hidden";
    document.addEventListener("keydown", handleDocumentKeyDown);
  } else {
    document.removeEventListener("keydown", handleDocumentKeyDown);
    bodyClass.value = "";
  }
});

function close() {
  open.value = false;
}

function handleDocumentKeyDown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    close();
  }
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/breakpoints.scss";

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0);
  transition: background-color 200ms;
  pointer-events: none;
  z-index: 11;
  &.open {
    background-color: rgba(0, 0, 0, 0.3);
    pointer-events: all;
  }
}
.sidebar {
  position: fixed;
  top: 0;
  right: -100%;
  width: 95%;
  height: 100vh;
  background-color: var(--background-color);
  transition: right 200ms;
  z-index: 12;
  overflow-y: auto;
  box-sizing: border-box;
  &.open {
    right: 0%;
  }
  &.inset {
    padding: 2rem;
  }
  @media screen and (min-width: breakpoints.$breakpoint-sm) {
    width: 80%;
  }
  @media screen and (min-width: breakpoints.$breakpoint-md) {
    width: 66.66%;
    max-width: 600px;
  }
}
.sidebar.size-md {
  @media screen and (min-width: breakpoints.$breakpoint-sm) {
    width: 95%;
  }
  @media screen and (min-width: breakpoints.$breakpoint-md) {
    width: 95%;
    max-width: 800px;
  }
}
.header-offset {
  top: calc(var(--navbar-height) + var(--navbar-offset));
  height: calc(100vh - var(--navbar-height));
}
</style>
