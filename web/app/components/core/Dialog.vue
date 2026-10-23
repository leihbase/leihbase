<template>
  <dialog
    ref="dialog"
    data-base-theme
    :class="{
      dialog: true,
      open,
      'was-open': wasOpen,
      inset,
      [`size-${size}`]: true,
    }"
    :aria-labelledby="id + '-title'"
    @close="close"
  >
    <header>
      <div class="title">
        <Heading is="h2" size="lg" :id="id + '-title'">{{ title }}</Heading>
        <button @click="close">
          <span class="sr-only">{{ t("close") }}</span>
          <Xmark />
        </button>
      </div>
      <slot name="header"></slot>
    </header>
    <div class="body">
      <slot></slot>
    </div>
  </dialog>
</template>

<script lang="ts" setup>
import { Xmark } from "@iconoir/vue";
import { templateRef } from "@vueuse/core";
import Heading from "./Heading.vue";

const { t } = useI18n({
  useScope: "local",
});

const id = useId();

const wasOpen = ref(false);
const dialog = templateRef("dialog");

withDefaults(
  defineProps<{
    /**
     * Title of dialog
     */
    title: string;
    /**
     * Add padding around dialog content
     */
    inset: boolean;
    /**
     * Dialog size
     */
    size?: "sm" | "md";
  }>(),
  { size: "md" }
);

const emit = defineEmits<{ close: [] }>();

const open = defineModel<boolean>("open");
watch(open, (newValue) => {
  if (!dialog.value) {
    throw new Error("Can't open Dialog, no 'dialog' found");
  }
  if (newValue) {
    dialog.value.showModal();
  } else {
    dialog.value.close();
    emit("close");
  }
  wasOpen.value = newValue || wasOpen.value;
});

onMounted(() => {
  if (!dialog.value) {
    throw new Error("No 'dialog' found in Dialog");
  }
  dialog.value.addEventListener("click", (e: MouseEvent) => {
    if (e.target === dialog.value) {
      open.value = false;
    }
  });
});

function close() {
  open.value = false;
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/breakpoints.scss";

dialog {
  inset: 0;
  margin: auto;
  height: 100%;
  max-height: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  z-index: 40;
  overflow-y: visible;
  padding: 0;
  background-color: white;
  border: 0;
  border-radius: var(--border-radius);
  animation-name: dialog-out;
  animation-duration: 0s;
  animation-fill-mode: both;
  visibility: hidden;

  // Back-drop
  &::backdrop {
    background-color: black;
    opacity: 0;
    transition: opacity 200ms;
  }
  &[open]::backdrop {
    opacity: 0.2;
  }

  &.was-open {
    animation-duration: 0.2s;
  }
  &[open] {
    animation-name: dialog-in;
  }
  &.inset {
    header {
      padding-top: 1.5rem;
    }
    header,
    .body {
      padding-left: 2rem;
      padding-right: 2rem;
    }
    .body {
      padding-bottom: 2rem;
    }
  }

  &.size-md {
    width: min(600px, 100%);
  }
  &.size-sm {
    width: min(400px, 100%);
  }

  @media screen and (min-width: breakpoints.$breakpoint-sm) {
    height: min-content;
    max-height: 95vh;
    max-width: 95vw;
  }
}

// Slide in from above the viewport
@keyframes dialog-in {
  from {
    visibility: hidden;
    transform: translateY(-100vh);
  }
  to {
    visibility: visible;
    transform: none;
  }
}

@keyframes dialog-out {
  from {
    visibility: visible;
    transform: none;
  }
  to {
    visibility: hidden;
    transform: translateY(-100vh);
  }
}

header {
  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    line-height: 1;
    margin-bottom: 1rem;
  }
  h2 {
    margin: 0;
  }
  button {
    background: transparent;
    border: 0;
    padding: 0.5rem;
    cursor: pointer;
  }
}
.body {
  overflow-y: auto;
}
</style>

<i18n lang="json">
{
  "en": {
    "close": "Close"
  },
  "de": {
    "close": "Schließen"
  }
}
</i18n>
