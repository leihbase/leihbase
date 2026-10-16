<template>
  <component
    :is="component"
    :type="component === 'button' ? type : undefined"
    :class="{
      ['variant-' + variant]: true,
      ['size-' + size]: true,
      circle,
      loading,
    }"
    :href="href"
    :to="to"
    :disabled="disabled || undefined"
    :data-client-mounted="isClientMounted"
    :title="title"
  >
    <span v-if="$slots.prefix" class="prefix">
      <slot name="prefix"></slot>
    </span>
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
import { NuxtLink } from "#components";
import type { ButtonHTMLAttributes } from "vue";

/**
 * Native attributes (e.g. `@click`, `aria-*`, `data-testid`) which fall
 * through to the rendered <button>, <a> or <NuxtLink>. Only used for type
 * checking, see `@vue-ignore`.
 */
interface NativeAttributes extends ButtonHTMLAttributes {
  target?: string;
  // data-* attributes, camelized by Vue
  [dataAttribute: `data${Capitalize<string>}`]: unknown;
}

interface Props extends /* @vue-ignore */ NativeAttributes {
  to?: string;
  href?: string;
  variant?: "primary" | "secondary";
  size?: "lg" | "md" | "sm";
  circle?: boolean;
  type?: "submit" | "reset" | "button" | undefined;
  loading?: boolean;
  disabled?: boolean;
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
  size: "md",
  type: "button",
  loading: false,
  disabled: false,
});

const { isClientMounted } = useClientMounted();

const component = computed(() => {
  if (props.to) return NuxtLink;
  if (props.href) return "a";
  return "button";
});
</script>

<style lang="scss" scoped>
a,
button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: var(--border-radius);
  cursor: pointer;
  text-decoration: none;

  &.variant-primary {
    background-color: var(--primary-color);
    border: 0;
    color: var(--primary-text-color);
    font-weight: var(--font-weight-semibold);
    &:hover {
      background-color: color-mix(in srgb, var(--primary-color) 80%, #000);
    }
  }
  &.variant-secondary {
    background-color: var(--secondary-color);
    color: var(--secondary-text-color);
    border: 0;
    &:hover {
      outline: 2px solid var(--primary-color);
    }
  }

  &.size-sm {
    padding: 0.333rem 0.666rem;
    gap: 0.35rem;
    font-size: var(--font-size-sm);
  }
  &.size-md {
    padding: 0.5rem 1rem;
    gap: 0.5rem;
    font-size: var(--font-size-md);
  }
  &.size-lg {
    padding: 0.666rem 1.5rem;
    gap: 0.666rem;
    font-size: var(--font-size-lg);
  }

  &.circle {
    border-radius: 100%;
    height: 2rem;
    width: 2rem;
    padding: 0.333rem;
    font-size: 1rem;
  }
  &.loading,
  &[disabled] {
    pointer-events: none;
    opacity: 0.5;
  }
  &.loading {
    &:after {
      content: "";
      width: 1em;
      height: 1em;
      margin-left: 0.666rem;
      border: 2px solid currentColor;
      border-bottom-color: transparent;
      border-radius: 50%;
      display: inline-block;
      box-sizing: border-box;
      animation: rotation 1s linear infinite;
    }
  }

  .prefix {
    display: inline-flex;
    flex-shrink: 0;
    width: 1em;
    height: 1em;
    align-items: center;
  }
}
@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
