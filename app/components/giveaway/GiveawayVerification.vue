<script setup lang="ts">
import { BadgeCheck, FileLock2, Hash, Link2, ShieldCheck } from '@lucide/vue'
import type { GiveawayLandingData } from '~~/shared/types/giveaway-landing'

defineProps<{
  giveaway: GiveawayLandingData
}>()

const processSteps = [
  {
    title: 'Після дедлайну заявки закриваються',
    description: 'Нові учасники більше не додаються, а вже подані заявки залишаються в тому самому порядку.',
    icon: FileLock2
  },
  {
    title: 'Список не можна тихо змінити',
    description: 'Ми залишаємо публічну позначку списку. Якщо хтось змінить учасників після дедлайну, це буде видно.',
    icon: Hash
  },
  {
    title: 'Випадковість береться ззовні',
    description: 'Для вибору використовується публічне число, яке неможливо знати заздалегідь або підлаштувати під потрібну людину.',
    icon: Link2
  },
  {
    title: 'Публікується результат',
    description: 'Після розіграшу видно номер переможця і дані, за якими можна перевірити, що вибір не змінювали вручну.',
    icon: ShieldCheck
  }
]
</script>

<template>
  <section id="verification" class="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="grid gap-5 lg:grid-cols-[minmax(0,0.88fr)_minmax(320px,0.62fr)]">
      <div class="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 sm:p-6">
        <div class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div class="max-w-2xl">
            <p class="text-sm font-medium uppercase tracking-[0.18em] text-violet-200">Прозорий вибір переможця</p>
            <h2 class="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
              Організатор не може просто вибрати “свою” людину.
            </h2>
            <p class="mt-4 text-sm leading-7 text-zinc-400 sm:text-base">
              Спочатку закривається список учасників. Потім переможець визначається через зовнішнє публічне число, яке ніхто не знає наперед. Так результат складніше підробити і простіше пояснити учасникам.
            </p>
          </div>
        </div>

        <div class="mt-8 grid gap-3 sm:grid-cols-2">
          <article
            v-for="step in processSteps"
            :key="step.title"
            class="rounded-2xl border border-white/10 bg-zinc-950/55 p-4"
          >
            <component :is="step.icon" class="h-5 w-5 text-violet-200" />
            <h3 class="mt-4 text-base font-semibold text-white">
              {{ step.title }}
            </h3>
            <p class="mt-2 text-sm leading-6 text-zinc-400">
              {{ step.description }}
            </p>
          </article>
        </div>
      </div>

      <aside class="rounded-[1.75rem] border border-white/10 bg-zinc-950/70 p-5 shadow-2xl shadow-black/25 sm:p-6">
        <h3 class="text-xl font-semibold text-white">
          Що це означає для учасника
        </h3>
        <div class="mt-5 space-y-4">
          <article class="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <p class="text-sm font-medium text-white">Після дедлайну список закривається</p>
            <p class="mt-2 text-sm leading-6 text-zinc-400">
              Коли реєстрація завершується, нові заявки вже не додаються. Переможець обирається тільки серед тих, хто встиг зареєструватися.
            </p>
          </article>
          <article class="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <p class="text-sm font-medium text-white">Організатор не вписує переможця вручну</p>
            <p class="mt-2 text-sm leading-6 text-zinc-400">
              Система бере закритий список учасників і сама визначає номер переможця. Це зменшує ризик, що результат підлаштують під конкретну людину.
            </p>
          </article>
          <article class="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <p class="text-sm font-medium text-white">Результат можна буде перевірити</p>
            <p class="mt-2 text-sm leading-6 text-zinc-400">
              Після вибору на сторінці буде показано номер переможця і службові дані перевірки. Вони потрібні не всім, але допомагають підтвердити, що результат не змінили заднім числом.
            </p>
          </article>
        </div>

        <div class="mt-5 rounded-2xl border border-violet-200/15 bg-violet-200/[0.07] p-4">
          <p class="text-sm font-medium text-white">
            Номери учасників видаються послідовно після кожної реєстрації
          </p>
          <p class="mt-1 text-sm leading-6 text-zinc-400">
            Це приклади формату номерів, а не повний список учасників.
          </p>
          <div class="mt-3 flex flex-wrap gap-2">
            <span
              v-for="number in giveaway.verification.sampleParticipantNumbers"
              :key="number"
              class="rounded-full border border-white/10 bg-black/20 px-3 py-1 font-mono text-xs text-zinc-300"
            >
              {{ number }}
            </span>
          </div>
        </div>

        <details class="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
          <summary class="cursor-pointer text-sm font-medium text-zinc-200 outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-violet-300">
            Технічні дані для перевірки
          </summary>
          <dl class="mt-4 space-y-4">
            <div>
              <dt class="text-xs uppercase tracking-[0.16em] text-zinc-500">Позначка списку</dt>
              <dd class="mt-2 break-all font-mono text-xs leading-6 text-violet-100">
                {{ giveaway.verification.participantListHash }}
              </dd>
            </div>
            <div>
              <dt class="text-xs uppercase tracking-[0.16em] text-zinc-500">Джерело випадковості</dt>
              <dd class="mt-2 text-sm leading-6 text-zinc-300">
                {{ giveaway.verification.seedSource }}
              </dd>
              <dd class="mt-1 text-sm leading-6 text-zinc-500">
                {{ giveaway.verification.seedAvailability }}
              </dd>
            </div>
          </dl>
        </details>
      </aside>
    </div>
  </section>
</template>
