<script setup lang="ts">
const steps = [
  {
    title: 'Зареєструйтеся',
    description: 'Вкажіть ім’я, email і за бажанням Telegram username до завершення реєстрації.'
  },
  {
    title: 'Отримайте номер учасника',
    description: 'Після реєстрації ви побачите номер учасника для цього розіграшу.'
  },
  {
    title: 'Дочекайтеся розіграшу',
    description: 'Організатор обирає переможця після завершення реєстрації та зв’язується з ним напряму.'
  }
]
</script>

<template>
  <section class="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="max-w-2xl">
      <p class="text-sm font-medium uppercase tracking-[0.18em] text-violet-200">Як це працює</p>
      <h2 class="mt-3 text-3xl font-semibold text-white sm:text-4xl">
        Три кроки без складної механіки.
      </h2>
    </div>

    <div class="mt-8 grid gap-4 md:grid-cols-3">
      <article
        v-for="(step, index) in steps"
        :key="step.title"
        class="rounded-2xl border border-white/10 bg-zinc-950/55 p-5 shadow-xl shadow-black/20"
      >
        <div class="grid h-10 w-10 place-items-center rounded-xl bg-violet-200 text-sm font-semibold text-zinc-950">
          {{ index + 1 }}
        </div>
        <h3 class="mt-5 text-lg font-semibold text-white">
          {{ step.title }}
        </h3>
        <p class="mt-2 text-sm leading-6 text-zinc-400">
          {{ step.description }}
        </p>
      </article>
    </div>
  </section>
</template>
