import { defineComponent } from 'vue'

const Child = defineComponent({
  render() {
    return (
      <div>Child</div>
    )
  }
})

export default defineComponent({
  render() {
    return (
      <div>
        Parent
        <Child />
      </div>
    )
  }
})