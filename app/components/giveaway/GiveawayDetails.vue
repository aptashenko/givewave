<script setup lang="ts">
import { CalendarClock, Gift, Trophy, Users } from '@lucide/vue'
import type { GiveawayLandingData } from '~~/shared/types/giveaway-landing'

const props = defineProps<{
  giveaway: GiveawayLandingData
}>()

const details = computed(() => [
  {
    label: 'Приз',
    value: props.giveaway.prize,
    icon: Gift
  },
  {
    label: 'Дедлайн реєстрації',
    value: props.giveaway.endDateLabel,
    icon: CalendarClock
  },
  {
    label: 'Кількість переможців',
    value: String(props.giveaway.winners),
    icon: Trophy
  },
  {
    label: 'Поточна кількість учасників',
    value: props.giveaway.participants.toLocaleString('uk-UA'),
    icon: Users
  }
])
</script>

<template>
  <section class="w-full min-w-0 max-w-[calc(100vw-2rem)] rounded-[1.75rem] border border-white/10 bg-zinc-950/60 p-5 shadow-2xl shadow-black/20 sm:max-w-none sm:p-6">
    <h2 class="text-2xl font-semibold text-white">
      Інформація про розіграш
    </h2>
    <div class="mt-5 grid gap-3">
      <article
        v-for="item in details"
        :key="item.label"
        class="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4"
      >
        <component :is="item.icon" class="mt-0.5 h-5 w-5 shrink-0 text-violet-200" />
        <div>
          <p class="text-sm text-zinc-500">{{ item.label }}</p>
          <p class="mt-1 text-sm font-medium leading-6 text-white">{{ item.value }}</p>
        </div>
      </article>
    </div>
  </section>
</template>
