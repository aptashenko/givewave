<script setup lang="ts">
import { LockKeyhole, Scale, WalletCards } from '@lucide/vue'

const items = [
  {
    title: 'Безкоштовна участь',
    description: 'Для участі не потрібні покупка, підписка або приховані платежі.',
    icon: WalletCards
  },
  {
    title: 'Прозорий вибір переможця',
    description: 'Результат розіграшу фіксується один раз і публікується після завершення прийому заявок.',
    icon: Scale
  },
  {
    title: 'Захист персональних даних',
    description: 'Ваші дані використовуються лише для перевірки заявки та зв’язку з переможцем.',
    icon: LockKeyhole
  }
]
</script>

<template>
  <section class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
    <div class="grid gap-3 md:grid-cols-3">
      <article
        v-for="item in items"
        :key="item.title"
        class="rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/10"
      >
        <component :is="item.icon" class="h-5 w-5 text-violet-200" />
        <h2 class="mt-4 text-base font-semibold text-white">
          {{ item.title }}
        </h2>
        <p class="mt-2 text-sm leading-6 text-zinc-400">
          {{ item.description }}
        </p>
      </article>
    </div>
  </section>
</template>
