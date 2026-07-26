<script setup lang="ts">
import type { GiveawayLandingData } from '~~/shared/types/giveaway-landing'

defineProps<{
  giveaway: GiveawayLandingData
}>()
</script>

<template>
  <footer class="border-t border-white/10">
    <div class="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-8 text-sm text-zinc-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
      <div>
        <p class="font-medium text-zinc-300">{{ giveaway.organizerName }}</p>
        <p class="mt-1">Організовано незалежно: {{ giveaway.organizerName }}.</p>
      </div>
      <nav aria-label="Посилання у футері" class="flex flex-wrap gap-4">
        <a :href="giveaway.termsUrl" class="rounded-md hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300">Умови</a>
        <a :href="giveaway.privacyUrl" class="rounded-md hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300">Приватність</a>
        <a :href="giveaway.organizerUrl" class="rounded-md hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300">Інформація про організатора</a>
      </nav>
    </div>
  </footer>
</template>
