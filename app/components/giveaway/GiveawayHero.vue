<script setup lang="ts">
import { ArrowDown, CalendarDays, ChevronRight } from '@lucide/vue'
import { Button as UiButton } from '~/components/ui/button'
import type { GiveawayLandingData } from '~~/shared/types/giveaway-landing'

defineProps<{
  giveaway: GiveawayLandingData
}>()

defineEmits<{
  participate: []
}>()
</script>

<template>
  <section class="mx-auto grid w-full max-w-7xl min-w-0 gap-10 px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.8fr)] lg:items-center lg:px-8">
    <div class="w-full min-w-0 max-w-[calc(100vw-2rem)] sm:max-w-3xl">
      <div class="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-violet-100">
        <span class="h-2 w-2 rounded-full bg-emerald-300" />
        Реєстрація відкрита
      </div>

      <h1 class="mt-6 max-w-[11ch] break-words text-4xl font-semibold leading-[0.98] tracking-normal text-white sm:max-w-none sm:text-6xl lg:text-7xl">
        {{ giveaway.title }}
      </h1>
      <p class="mt-6 max-w-[32ch] text-base leading-8 text-zinc-300 sm:max-w-2xl sm:text-lg">
        {{ giveaway.description }}
      </p>

      <div class="mt-7 flex flex-col gap-3 text-sm text-zinc-400 sm:flex-row sm:items-center">
        <div class="inline-flex items-center gap-2">
          <CalendarDays class="h-4 w-4 text-violet-200" />
          Реєстрація завершується {{ giveaway.endDateLabel }}
        </div>
        <span class="hidden h-1 w-1 rounded-full bg-zinc-700 sm:block" />
        <span>{{ giveaway.participants.toLocaleString('uk-UA') }} учасників уже долучилися</span>
      </div>

      <div class="mt-8 w-full max-w-[calc(100vw-2rem)] min-w-0 sm:max-w-xl">
        <GiveawayCountdown :end-date-iso="giveaway.endDateIso" />
      </div>

      <div class="mt-8 grid w-full gap-3 sm:flex sm:w-auto sm:flex-row">
        <UiButton
          class="h-12 w-full rounded-xl bg-violet-200 px-6 text-base text-zinc-950 shadow-lg shadow-violet-950/30 hover:bg-white focus-visible:ring-violet-200 sm:w-auto"
          @click="$emit('participate')"
        >
          Взяти участь
          <ArrowDown class="h-4 w-4" />
        </UiButton>
        <a
          :href="giveaway.rulesUrl"
          class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 text-base font-medium text-white transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 sm:w-auto"
        >
          Переглянути правила
          <ChevronRight class="h-4 w-4" />
        </a>
      </div>
    </div>

    <GiveawayPrizeCard :giveaway="giveaway" />
  </section>
</template>
