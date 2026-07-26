<script setup lang="ts">
interface CountdownItem {
  label: string
  value: string
}

const props = defineProps<{
  endDateIso: string
}>()

const items = ref<CountdownItem[]>([
  { label: 'Днів', value: '--' },
  { label: 'Годин', value: '--' },
  { label: 'Хвилин', value: '--' },
  { label: 'Секунд', value: '--' }
])

let timer: ReturnType<typeof setInterval> | undefined

function formatUnit(value: number) {
  return String(Math.max(0, value)).padStart(2, '0')
}

function updateCountdown() {
  const diff = Math.max(0, new Date(props.endDateIso).getTime() - Date.now())
  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  items.value = [
    { label: 'Днів', value: formatUnit(days) },
    { label: 'Годин', value: formatUnit(hours) },
    { label: 'Хвилин', value: formatUnit(minutes) },
    { label: 'Секунд', value: formatUnit(seconds) }
  ]
}

onMounted(() => {
  updateCountdown()
  timer = setInterval(updateCountdown, 1000)
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<template>
  <div class="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 sm:grid-cols-4" aria-label="Зворотний відлік розіграшу">
    <div
      v-for="item in items"
      :key="item.label"
      class="min-w-0 rounded-xl border border-white/10 bg-white/[0.055] px-2.5 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm sm:px-4"
    >
      <div class="text-xl font-semibold tabular-nums text-white sm:text-3xl">
        {{ item.value }}
      </div>
      <div class="mt-1 text-[0.62rem] font-medium uppercase tracking-[0.14em] text-zinc-500 sm:text-xs sm:tracking-[0.18em]">
        {{ item.label }}
      </div>
    </div>
  </div>
</template>
