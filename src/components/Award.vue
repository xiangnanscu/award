<script setup>
import { ref, computed, reactive } from 'vue'
import { writeFileXLSX, utils } from 'xlsx/xlsx.mjs';
import XSelect from './XSelect.vue';
import XPageTable from './XPageTable.vue';


const props = defineProps({
  ranks: Array,
  records: Array
})
// const sizeArray = [200, 200, 80, 50, 50, 20]
const awardRanks = reactive(props.ranks.slice().map(rank => ({ ...rank, luckyGuys: [], })))
const awardRecords = ref(props.records.map(e => ({ ...e, 手机号: String(e.手机号) })))
const chosenRecords = ref(awardRecords.value.filter(e => e.tagged !== 0))

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
  for (let i = c; i < ncol; i++) {
    row.push({ 手机号: '' })
  }
  if (c > 0) {
    ret.push(row)
  }
  return ret
}
function range(n) {
  return Array.from({ length: n }, (_, i) => i)
}
function randomNumber(max) {
  return Math.floor(Math.random() * max);
}
function getRandomIndexes(len, size) {
  let indexes = range(len)
  let ret = []
  for (let i = 0; i < size; i++) {
    ret.push(...indexes.splice(randomNumber(indexes.length), 1))
  }
  return ret
}
function getRandomElements(arr, size) {
  return getRandomIndexes(arr.length, size).map(i => arr[i])
}
function shuffle(arr) {
  return getRandomElements(arr, arr.length)
}
const luckyRows = computed(() => awardRanks.map(e => e.luckyGuys).flat().map(e => {
  delete e.tagged
  return e
}))
function load() {
  return JSON.parse(localStorage.getItem("rows"))
}
function exportLuckyGuys() {
  const ws = utils.json_to_sheet(load() || luckyRows.value);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "中奖名单");
  writeFileXLSX(wb, "喜迎二十大答题活动中奖名单.xlsx");
}
let randomIndexes = ref([])
let starteRandom = ref(false)
let currentRankIndex = ref(5)
let markRanks = computed(() => awardRanks.map((rank, index) => {
  let mustLuckyRecords = awardRecords.value.filter(r => r.tagged === index + 1)
  return { ...rank, mustLuckyRecords }
}))
let currentRank = computed(() => markRanks.value[currentRankIndex.value])
let currentPersons = computed(() => randomIndexes.value.map(i => awardRecords.value[i]))
let snapPersons = ref([])
watch(currentRankIndex, () => {
  randomIndexes.value = []
  snapPersons.value = []
  actionHint.value = ""
})
let boardPersons = computed(() => starteRandom.value ? currentPersons.value : snapPersons.value)
let boardPersonTable = computed(() => trunk(boardPersons.value, currentRank.value.列数))
let currentHintText = computed(() => {
  let cr = currentRank.value
  return cr ? `${cr.等次}${cr.名额}名|${cr.奖品内容}|每次抽取${cr.每轮抽取人数}名|已抽中${cr.luckyGuys.length}名|还剩${cr.名额 - cr.luckyGuys.length}名未抽|总数${awardRecords.value.length + chosenRecords.value.length}名` : ""
})
let baseSize = ref(150)
let baseSpeed = ref(0.2)

let interval = ref(null)
let fontHeight = computed(() => baseSize.value * 0.5 + 'px')
let phoneMargin = computed(() => baseSize.value * 0.2 + 'px')
let leaveCnt = ref('0px')
let inoutCnt = ref('50px')
let actionHint = ref("")
let downupTime = computed(() => baseSpeed.value + 's')
let inoutTime = computed(() => baseSpeed.value * 1.2 + 's')
let numberHeight = computed(() => {
  return baseSize.value / currentRank.value.列数 * 2.2 + 'px'
})
let showLuckyList = ref(false)
let theOneMargin = computed(() => {
  if (currentRankIndex.value === 0) {
    return '160px'
  } else if (currentRankIndex.value === 1) {
    return '150px'
  } else {
    return '0px'
  }
})
// let currentSize = computed(() => sizeArray[currentRankIndex.value] + 'px')
function start(params) {
  let cr = currentRank.value
  let guys = cr.luckyGuys
  if (guys.length >= cr.名额) {
    actionHint.value = "当前等次名额已抽满"
    return
  }
  starteRandom.value = true
  actionHint.value = ""
  snapPersons.value = []
  if (!interval.value) {
    interval.value = setInterval(function () {
      // let restCnt = cr.名额 - cr.luckyGuys.length
      // let sizeCnt = cr.每轮抽取人数
      // let cnt = restCnt < sizeCnt ? restCnt : sizeCnt
      randomIndexes.value = getRandomIndexes(awardRecords.value.length, cr.名额)
    }, baseSpeed.value * 1000)
  }
}
function end(params) {
  if (!starteRandom.value) {
    actionHint.value = "当前没有处于随机抽取状态，无法结束"
    return
  }
  starteRandom.value = false
  clearInterval(interval.value)
  interval.value = null
  let cr = currentRank.value
  let dc = currentRankIndex.value + 1
  // checking fixed users
  let realIndexes = []
  awardRecords.value.forEach((p, i) => {
    if (p.tagged === dc) {
      realIndexes.push(i)
    }
  })
  let restCnt = cr.名额 - realIndexes.length
  // using existing lucky guys first
  realIndexes.push(...randomIndexes.value.filter(i => awardRecords.value[i].tagged === 0).slice(0, restCnt))
  // random again
  restCnt = cr.名额 - realIndexes.length
  if (restCnt > 0) {
    let avalableIndexes = []
    awardRecords.value.forEach((p, i) => {
      if (p.tagged === 0 && !realIndexes.includes(i)) {
        avalableIndexes.push(i)
      }
    })
    realIndexes.push(...getRandomElements(avalableIndexes, restCnt))
  }
  randomIndexes.value = shuffle(realIndexes)
  snapPersons.value = currentPersons.value.slice()
  // console.log("randomIndexes", randomIndexes.value.join(','))
  currentRank.value.luckyGuys.push(...currentPersons.value.map(p => ({ ...p, 等次: currentRankIndex.value + 1 })));
  const luckyMap = Object.fromEntries(currentPersons.value.map(p => [p.手机号, p]))
  awardRecords.value = awardRecords.value.filter(e => !luckyMap[e.手机号])
  save(luckyRows.value)
  // console.log("currentRank.value.luckyGuys:", currentRank.value.luckyGuys)
}
function save(obj) {
  localStorage.setItem("rows", JSON.stringify(obj))
}
function hideName(name) {
  if (!name) {
    return ""
  }
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
window.addEventListener('keyup', function (event) {
  const code = event.code
  console.log({ code })
  const matchNumber = code.match(/(Digit|Numpad)([1-6])/)
  if (matchNumber) {
    let n = Number(matchNumber[2])
    currentRankIndex.value = n - 1
    showLuckyList.value = false
    return
  }
  if (code == 'Backquote') {
    starteRandom.value ? end() : start()
    return
  }
  if (code == 'Backspace') {
    showLuckyList.value = !showLuckyList.value
    return
  }

})
</script>

<template>
  <div class="noscroll" style="width:1519px;margin:auto">
    <button @click="showLuckyList=!showLuckyList" class="btn lucky-list">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-card-list"
        viewBox="0 0 16 16">
        <path
          d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z" />
        <path
          d="M5 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 5 8zm0-2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-1-5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zM4 8a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm0 2.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" />
      </svg>
    </button>
    <div class="row" style="margin-top:1em">
      <div class="col text-center">
        <button @click="exportLuckyGuys" class="btn btn-warning">导出名单</button>
        <div class="btn-group" role="group">
          <div v-for="rank, i in awardRanks">
            <input v-model="currentRankIndex" :value="i" type="radio" class="btn-check" :id="rank.等次" autocomplete="off"
              :checked="currentRankIndex===i" />
            <label @click="showLuckyList=false" class="btn btn-outline-danger" :for="rank.等次">{{rank.等次}}</label>
          </div>
        </div>
        <button v-if="!starteRandom" @click="start" class="btn btn-warning">开始</button>
        <button v-else @click="end" class="btn btn-warning">停止</button>
      </div>
    </div>
    <!-- <div class="row">
      <div class="col">
        <div class="hint">{{actionHint}}</div>
        <div class="hint">{{currentHintText}}</div>
      </div>
    </div> -->
    <div v-if="!showLuckyList" class="row the-one-margin">
      <div class="col">
        <div class="panel">
          <div v-for="pr in boardPersonTable" class="row">
            <div v-for="p in pr" class="col">
              <div v-if="p.手机号">
                <!-- <div v-if="!starteRandom && currentRankIndex<3" v-resize-text="{ratio:currentRank.ratio*2}"
                  class="p2 text-center">
                  {{hideName(p.姓名)}} · {{hidePhone(p.手机号)}} · {{p.答题市}}
                </div> -->
                <div class="p2 text-center" v-resize-text="{ratio:currentRank.ratio}">
                  {{hidePhone(p.手机号)}}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="row the-one-margin">
      <div class="col">
        <div class="award-title">{{currentRank.等次}}中奖名单</div>
        <XPageTable :records="currentRank.luckyGuys" :fontsize="currentRank.fontsize" :pagesize="currentRank.pagesize"
          :ncols="currentRank.名单列数">
        </XPageTable>

      </div>
    </div>
  </div>

</template>

<style scoped>
.the-one-margin {
  margin-top: v-bind(theOneMargin);
}

.award-title {
  font-family: 方正小标宋简体;
  text-align: center;
  font-size: 60px;
  letter-spacing: 50px;
  font-weight: bold;
  color: bisque;
  color: white;
}

.imodal {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1055;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  outline: 0;
}

.noscroll {
  overflow-y: hidden;
}

.noscroll::-webkit-scrollbar {
  display: none;
}

.lucky-list {
  position: fixed;
  top: 0;
  left: 0;
  background-color: transparent;
}

.p2 {
  color: rgba(70, 10, 10, 0.877);
}

.card-header {
  font-size: 120%;
  font-weight: bold;
}

.card,
.list-group-item {
  text-align: center;
  background-color: transparent;
  color: rgba(70, 10, 10, 0.877);
}

.hint {
  font-size: 2em;
  font-weight: bold;
  text-align: center;
  color: bisque;
}

.phone {
  display: flex;
  flex-direction: row;
  justify-content: center;
  height: v-bind(numberHeight);
  /* background-color: #fff; */
  /* width: 70%; */
  /* margin: auto; */
  opacity: 0.8;
  overflow: hidden;
}

.phone .num {
  /*position: absolute;*/
  /* background: transparent; */
  color: #fff;
  opacity: 1;
  /* width: 30px; */
  height: v-bind(numberHeight);
  line-height: v-bind(numberHeight);
  font-weight: bold;
  /* font-family:'宋体'; */
  /* float: left; */
  margin-right: 2px;
}
</style>