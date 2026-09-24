<template>
  <div :class="{ root: true, ['orientation-' + orientation]: true }">
    <input
      type="checkbox"
      :id="id"
      :name="name"
      :data-testid="dataTestid"
      :disabled="disabled"
      :readonly="readonly"
      :aria-describedby="
        [description ? `${id}-description` : null].filter((v) => !!v).join(' ')
      "
      v-model="model"
    />
    <label :for="id" role="switch" :aria-checked="model">
      <span class="switch">
        <Check class="check" />
      </span>
      <FormLabel is="span" hide-required>{{ label }}</FormLabel>
    </label>
    <p v-if="description" :id="`${id}-description`" class="descrption">
      <small>{{ description }}</small>
    </p>
  </div>
</template>

<script lang="ts" setup>
import { Check } from "@iconoir/vue";
import FormLabel from "./FormLabel.vue";

const model = defineModel<boolean>();
const props = withDefaults(
  defineProps<{
    id: string;
    label: string;
    name?: string;
    value?: boolean;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    type?: string;
    dataTestid?: string;
    orientation?: "vertical" | "horizontal";
    description?: string;
  }>(),
  { orientation: "vertical" }
);
if (props.value) {
  model.value = props.value;
}
</script>

<style scoped>
.root {
  width: 100%;
}
.root.orientation-vertical label {
  flex-direction: column-reverse;
}
label span {
  font-weight: var(--font-weight-bold);
  color: var(--text-color);
}
input {
  opacity: 0;
  position: absolute;
}
label {
  display: inline-flex;
  column-gap: var(--spacing-2);
  cursor: pointer;
}
input:focus-visible + label .switch {
  outline: 2px solid var(--text-color);
  outline-offset: 2px;
}
label .switch {
  --margin: 0.2rem;
  --knob-size: 1.1rem;
  display: inline-block;
  height: calc(var(--knob-size) + var(--margin) * 2);
  width: calc(var(--knob-size) * 2 + var(--margin) * 2);
  background: color-mix(
    in srgb,
    var(--text-color) 60%,
    var(--background-color)
  );
  border-radius: calc(var(--knob-size) + 0.4rem);
  cursor: pointer;
  color: white;
  position: relative;
}
label .switch .check {
  display: none;
  position: absolute;
  width: calc(var(--knob-size) - 4px);
  height: calc(var(--knob-size) - 4px);
  top: 50%;
  left: calc(var(--margin) + 1px);
  transform: translateY(-50%);
  stroke-width: 3px;
}
label .switch:before {
  content: "";
  display: block;
  height: var(--knob-size);
  width: var(--knob-size);
  border-radius: var(--knob-size);
  background: #fff;
  margin-top: 0.2rem;
  margin-left: 0.2rem;
  transition: all 300ms;
}
input:checked + label .switch {
  background: #4bd865;
}
input:checked + label .switch .check {
  display: block;
}
input:checked + label .switch:before {
  transform: translate3d(100%, 0, 0);
}
</style>
