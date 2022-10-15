<script setup>
import Award from './components/Award.vue'
import { read, utils } from 'xlsx/xlsx.mjs';
import dataFile from './data.xlsx?b64'
import ranskFile from './ranks.xlsx?b64'

// console.log({ dataFile })
const records = reactive([])
const ranks = reactive([])
async function readXlsx(event) {
  const f = event.target.files[0]
  const wb = read(await f.arrayBuffer());
  const data = utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  records.splice(0)
  records.push(...data)
}
onMounted(() => {
  const wb = read(dataFile);
  const data = utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  records.push(...data)
  const wb2 = read(ranskFile);
  const data2 = utils.sheet_to_json(wb2.Sheets[wb2.SheetNames[0]]);
  ranks.push(...data2)
  console.log({ records , ranks})
})
</script>

<template>
  <div class="container-fluid">
    <!-- <input type="file" @input="readXlsx" /> -->
    <Award v-if="ranks.length" :records="records" :ranks="ranks"/>
  </div>
</template>

<style scoped>
.bk {
  /* width: 90%; */
  margin: auto;
}
</style>
