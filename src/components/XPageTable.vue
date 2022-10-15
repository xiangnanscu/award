<script setup>
import { computed, defineProps } from "vue"
const props = defineProps(["records", "pagesize", "ncols", "columns", "fontsize"]);

function trunk(arr, ncol) {
  let c = 0
  let ret = []
  let row = []
  for (const p of arr) {
    if (c === ncol) {
      ret.push(row)
      row = []
      c = 0
    }
    row.push(p)
    c++
  }
  // padding
  for (let i = c; i < ncol; i++) {
    row.push({ "手机号": "", "姓名": "", "答题市": "" })
  }
  if (c > 0) {
    ret.push(row)
  }
  return ret
}
const fontsize = ref((props.fontsize || 10)+'px')
const ncols = ref(props.ncols || 1)
const pagesize = ref(props.pagesize || 100)
const pages = computed(() => Math.ceil(props.records.length / pagesize.value))
const currentPage = ref(0)
const currentRecords = computed(() => props.records.filter((e, i) => {
  return i >= pagesize.value * currentPage.value && i < pagesize.value * (currentPage.value + 1)
}))
const rows = computed(() => trunk(currentRecords.value, ncols.value))
function hideName(name) {
  let res = name.slice(-4).split("").slice(0, -1).map(c => '*').join("") + name.slice(-1)
  return res.length == 2 ? ' ' + res : res
}
function hidePhone(s) {
  if (!s) {
    return ""
  }
  let a = s.split("")
  return `${a.slice(0, 3).join("")}****${a.slice(-4).join("")}`
}
</script>

<template>
  <div>
    <nav>
      <ul v-if="pages>1" class="pagination justify-content-center">
        <li v-for="n in pages" class="page-item">
          <a @click="currentPage=n-1" :class="{'page-link':true, active: currentPage===n-1}" href="#">{{n}}</a>
        </li>
      </ul>
    </nav>
    <table class="table">
      <tbody>
        <tr v-for="(row, i) in rows">
          <td v-for="p in row" class="cell text-center">
            {{hideName(p.姓名)}} {{hidePhone(p.手机号)}}
            <span v-if="rows.length!==1">{{p.答题市}}</span>
            <div v-else>{{p.答题市}}</div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.cell {
  font-size: v-bind(fontsize);
  color: rgba(70, 10, 10, 0.877);
}
td.cell {
  padding: 3px;
}
.page-link  {
  background-color: bisque;
  color: rgba(70, 10, 10, 0.877);
}
.page-item .active {
  background-color: rgba(85, 13, 13, 0.685);
  color:white;
}
 tr, td, th {
  border-style:none;
 }
</style>