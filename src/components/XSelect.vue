<script setup>
import { computed, defineProps } from "vue"
const props = defineProps(["modelValue", "label", "choices", "defaultChoice"]);
defineEmits(["update:modelValue"]);
const selectChoices = computed(() => {
  return props.choices.map((c) =>
    typeof c !== "object" ? { value: c, label: c } : { value: c.value, label: c.label }
  );
});
const _defaultChoice = computed(() => props.defaultChoice ?? { value: "", label: "请选择" });
</script>

<template>
  <div class="mb-3">
    <label class="form-label">{{ label }}</label>
    <select class="form-control" required="required" :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)">
      <option disabled :value="_defaultChoice.value">{{ _defaultChoice.label }}</option>
      <option v-for="c in selectChoices" :value="c.value">{{ c.label }}</option>
    </select>
  </div>
</template>