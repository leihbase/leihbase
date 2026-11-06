<template>
  <div>
    <nav>
      <ul class="tablist">
        <li v-for="tab in getTabs()" :key="tab.props?.id">
          <button
            :class="activeTabId === tab.props?.id ? 'active' : ''"
            @click="handleClick(tab)"
          >
            <WarningTriangle v-if="tab?.props?.warning" />
            {{ tab?.props?.title }}
          </button>
        </li>
      </ul>
    </nav>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { WarningTriangle } from "@iconoir/vue";
import { Comment } from "vue";
import type { TabProps } from "./Tab.model";
import type Tab from "./Tab.vue";

const props = defineProps<{ active: string }>();

defineSlots<{
  default(): InstanceType<typeof Tab>;
}>();

const slots = useSlots();
const activeTabId = ref<string | null>(props.active);
const activeTabProps = ref<TabProps | undefined>();

provide("activeTabId", activeTabId);

function handleClick(tab: VNode) {
  activeTabId.value = tab.props?.id;
  activeTabProps.value = tab.props as TabProps;
}

/**
 * The tabs in the slot, read on every render so tabs shown or hidden later (by
 * `v-if`) are included, without the placeholders of hidden ones
 */
function getTabs() {
  return (slots.default?.() || []).filter((tab) => tab.type !== Comment);
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/breakpoints.scss";

ul {
  --spacing-between: var(--fluid-spacing-4);
  --spacing-start: var(--fluid-spacing-4);
  --spacing-end: var(--fluid-spacing-4);
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;
  overflow-x: auto;
}
li {
  display: flex;
  align-items: flex-end;
}
li:first-child::before,
li::after {
  content: "";
  height: 1px;
  background-color: var(--text-color);
  width: var(--spacing-between);
}
li:first-child::before {
  width: var(--spacing-start);
}
li:last-child {
  width: 100%;
  &::after {
    width: 100%;
    min-width: var(--spacing-end);
  }
}
button {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  background: transparent;
  border-width: 1px 1px 1px 1px;
  border-color: var(--text-color);
  color: var(--text-color);
  border-style: solid;
  padding: 0.6rem 0.895rem;
  line-height: 1;
  cursor: pointer;
  border-radius: var(--border-radius) var(--border-radius) 0 0;
  &.active {
    font-weight: var(--font-weight-semibold);
    border-bottom: 1px solid transparent;
  }
  @media screen and (min-width: breakpoints.$breakpoint-sm) {
    min-width: 6rem;
  }
  svg {
    width: 1em;
    height: 1em;
    margin-right: 0.5rem;
    margin-left: -0.25rem;
    color: rgb(172, 19, 19);
  }
}
</style>
