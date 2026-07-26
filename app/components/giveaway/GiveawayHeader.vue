<script setup lang="ts">
import { ShieldCheck, Users } from '@lucide/vue'
import type { GiveawayLandingData } from '~~/shared/types/giveaway-landing'

defineProps<{
  giveaway: GiveawayLandingData
}>()
</script>

<template>
  <header class="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
    <NuxtLink to="/" class="group inline-flex min-w-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 sm:gap-3">
      <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-violet-300/20 bg-violet-300/10 text-sm font-semibold text-violet-100 shadow-lg shadow-violet-950/30">
        G
      </span>
      <span class="hidden min-w-0 sm:block">
        <span class="block truncate text-sm font-semibold text-white">Giveaway Studio</span>
        <span class="block truncate text-xs text-zinc-500">{{ giveaway.organizerName }}</span>
      </span>
    </NuxtLink>

    <nav aria-label="Навігація розіграшу" class="flex items-center gap-2 sm:gap-3">
      <a
        :href="giveaway.rulesUrl"
        class="hidden rounded-md px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 sm:inline-flex"
      >
        Правила
      </a>
      <div class="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-sm text-zinc-300 sm:inline-flex">
        <Users class="h-4 w-4 text-violet-200" />
        {{ giveaway.participants.toLocaleString('uk-UA') }}
      </div>
      <div class="inline-flex min-w-0 items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-2 text-xs font-medium text-emerald-100 sm:px-3">
        <ShieldCheck class="h-3.5 w-3.5" />
        <span class="sm:hidden">Активний</span>
        <span class="hidden sm:inline">Розіграш активний</span>
      </div>
    </nav>
  </header>
</template>
