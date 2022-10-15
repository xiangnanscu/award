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
  if (c > 0) {
    ret.push(row)
  }
  return ret
}

console.log(trunk([1,2,3,4,5,6,7],4))