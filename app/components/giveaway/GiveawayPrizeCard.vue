<script setup lang="ts">
import { Gift, Star, TicketCheck } from '@lucide/vue'
import type { GiveawayLandingData } from '~~/shared/types/giveaway-landing'

const props = defineProps<{
  giveaway: GiveawayLandingData
}>()

const prizeTitle = computed(() => {
  const title = props.giveaway.title.replace(/^(win|виграйте)\s+/i, '').trim()

  if (!title) {
    return 'Призовий пакет'
  }

  return `${title.charAt(0).toUpperCase()}${title.slice(1)}`
})
</script>

<template>
  <aside class="w-full min-w-0 max-w-[calc(100vw-2rem)] overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-950/80 p-4 shadow-2xl shadow-black/40 sm:max-w-none sm:p-5">
    <div class="mx-8 h-px bg-gradient-to-r from-transparent via-violet-300/60 to-transparent" />
    <div class="min-w-0 rounded-[1.35rem] border border-white/10 bg-[radial-gradient(circle_at_20%_0%,rgba(168,85,247,0.28),transparent_34%),linear-gradient(145deg,rgba(39,39,42,0.95),rgba(9,9,11,0.96))] p-5 sm:p-6">
      <div class="flex items-center justify-between gap-3">
        <span class="rounded-full border border-violet-200/20 bg-violet-200/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-violet-100">
          {{ giveaway.prizeEyebrow }}
        </span>
        <Star class="h-5 w-5 text-violet-200" />
      </div>

      <div class="mt-12 space-y-5">
        <div class="grid h-20 w-20 place-items-center rounded-3xl border border-white/10 bg-white/[0.06] shadow-xl shadow-black/30">
          <Gift class="h-9 w-9 text-violet-100" />
        </div>
        <div>
          <h2 class="max-w-[15ch] break-words text-2xl font-semibold leading-tight text-white sm:max-w-none sm:text-3xl">
            {{ prizeTitle }}
          </h2>
          <p class="mt-3 text-sm leading-6 text-zinc-400">
            {{ giveaway.prize }}
          </p>
        </div>
      </div>

      <div class="mt-8 grid gap-3 sm:grid-cols-2">
        <div class="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p class="text-xs uppercase tracking-[0.16em] text-zinc-500">Переможців</p>
          <p class="mt-1 text-2xl font-semibold text-white">{{ giveaway.winners }}</p>
        </div>
        <div class="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p class="text-xs uppercase tracking-[0.16em] text-zinc-500">Участь</p>
          <p class="mt-1 flex items-center gap-2 text-sm font-medium text-white">
            <TicketCheck class="h-4 w-4 text-violet-200" />
            Безкоштовна
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>
