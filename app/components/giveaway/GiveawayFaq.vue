<script setup lang="ts">
const faqs = [
  {
    question: 'Хто може брати участь?',
    answer: 'Брати участь можуть люди від 18 років, з якими можна зв’язатися email, якщо місцеві правила не встановлюють інших обмежень.'
  },
  {
    question: 'Участь безкоштовна?',
    answer: 'Так. Участь безкоштовна і не потребує покупки, платної підписки або тестового періоду продукту.'
  },
  {
    question: 'Як обирається переможець?',
    answer: 'Після завершення реєстрації список учасників фіксується. Потім він поєднується з публічним зовнішнім джерелом випадковості, тому результат можна перевірити повторно.'
  },
  {
    question: 'Як зв’яжуться з переможцем?',
    answer: 'Спочатку переможцю напишуть на email. Якщо вказано Telegram username, його можуть використати як резервний спосіб зв’язку.'
  }
]
</script>

<template>
  <section class="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="max-w-2xl">
      <p class="text-sm font-medium uppercase tracking-[0.18em] text-violet-200">Питання</p>
      <h2 class="mt-3 text-3xl font-semibold text-white sm:text-4xl">
        Зрозумілі правила до участі.
      </h2>
    </div>

    <div class="mt-8 grid gap-3">
      <details
        v-for="faq in faqs"
        :key="faq.question"
        class="group rounded-2xl border border-white/10 bg-white/[0.035] p-5 open:bg-white/[0.055]"
      >
        <summary class="cursor-pointer list-none text-base font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300">
          <span class="flex items-center justify-between gap-4">
            {{ faq.question }}
            <span class="text-violet-200 transition group-open:rotate-45 motion-reduce:transition-none">+</span>
          </span>
        </summary>
        <p class="mt-3 text-sm leading-6 text-zinc-400">
          {{ faq.answer }}
        </p>
      </details>
    </div>
  </section>
</template>
