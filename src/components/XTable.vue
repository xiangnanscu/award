<script setup>
import { computed, defineProps } from "vue"
const props = defineProps(["rows", "hash", "columns"]);
const tableColumns = computed(() => {
  if (!props.columns) {
    return Object.keys(props.rows[0] || {});
  } else {
    return props.columns;
  }
});
</script>

<template>
  <table class="table table-bordered table-hover">
    <thead>
      <tr>
        <th>#</th>
        <th v-for="col in tableColumns">{{ col }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, i) in rows">
        <td>{{ i + 1 }}</td>
        <td v-for="col in tableColumns">{{ row[col] }}</td>
      </tr>
    </tbody>
  </table>
</template>
