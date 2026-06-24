// Debounce composable — same pattern as your trading platform
// 🔵 VUE DEV NOTE: Composables ARE Vue — identical syntax to what you know.
// In React: custom hooks. Same concept, different syntax.
export function useDebounce<T>(value: Ref<T>, delay = 300): Ref<T> {
  const debounced = ref<T>(value.value) as Ref<T>
  let timer: ReturnType<typeof setTimeout>

  watch(value, (newVal) => {
    clearTimeout(timer)
    timer = setTimeout(() => { debounced.value = newVal }, delay)
  })

  onUnmounted(() => clearTimeout(timer))
  return debounced
}
