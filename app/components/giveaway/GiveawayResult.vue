<script setup lang="ts">
import { CheckCircle2, Clock3, Mail, ShieldCheck, Trophy } from '@lucide/vue'
import type { GiveawayLandingData, GiveawayPublicState, GiveawayPublicWinner } from '~~/shared/types/giveaway-landing'
import { maskPublicWinnerName } from '~~/shared/utils/giveaway-rules'

const props = defineProps<{
  giveaway: GiveawayLandingData
  state: GiveawayPublicState
  winners: GiveawayPublicWinner[]
}>()

const isPicked = computed(() => props.state === 'picked')
const statusLabel = computed(() => isPicked.value ? 'Результат опубліковано' : 'Очікуємо результат')
const title = computed(() => isPicked.value ? 'Переможця обрано' : 'Реєстрацію завершено')
const description = computed(() => {
  if (isPicked.value) {
    return 'Організатор уже зафіксував результат. Переможця буде контактовано за даними, які він залишив у заявці.'
  }

  return 'Заявки більше не приймаються. Організатор має натиснути кнопку вибору переможця в адмін-панелі, після чого результат з’явиться тут.'
})

function formatWinnerName(winner: GiveawayPublicWinner) {
  return maskPublicWinnerName(winner.name, `Учасник ${winner.participantNumber || `#${winner.position}`}`)
}
</script>

<template>
  <section class="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/25 sm:p-6">
    <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div class="max-w-2xl">
        <div class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-sm font-medium text-violet-100">
          <CheckCircle2 v-if="isPicked" class="h-4 w-4 text-emerald-300" />
          <Clock3 v-else class="h-4 w-4 text-amber-200" />
          {{ statusLabel }}
        </div>
        <h2 class="mt-4 text-3xl font-semibold tracking-normal text-white sm:text-4xl">
          {{ title }}
        </h2>
        <p class="mt-3 text-sm leading-6 text-zinc-300 sm:text-base">
          {{ description }}
        </p>
      </div>

      <div class="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300 sm:min-w-72">
        <div class="flex items-start gap-3">
          <ShieldCheck class="mt-0.5 h-5 w-5 shrink-0 text-violet-200" />
          <p>Список заявок закрито після дедлайну: {{ giveaway.endDateLabel }}.</p>
        </div>
        <div class="flex items-start gap-3">
          <Mail class="mt-0.5 h-5 w-5 shrink-0 text-violet-200" />
          <p>Переможця контактують приватно, тому email не публікується на сторінці.</p>
        </div>
      </div>
    </div>

    <div v-if="isPicked" class="mt-6 grid gap-3 md:grid-cols-2">
      <article
        v-for="winner in winners"
        :key="winner.id"
        class="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4"
      >
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-sm text-emerald-100/80">Переможець #{{ winner.position }}</p>
            <p class="mt-1 text-xl font-semibold text-white">{{ formatWinnerName(winner) }}</p>
          </div>
          <div class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-300 text-zinc-950">
            <Trophy class="h-5 w-5" />
          </div>
        </div>
        <div class="mt-4 flex flex-wrap gap-2 text-sm">
          <span
            v-if="winner.participantNumber"
            class="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-zinc-200"
          >
            Номер: {{ winner.participantNumber }}
          </span>
          <span
            v-if="winner.handle"
            class="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-zinc-200"
          >
            {{ winner.handle }}
          </span>
        </div>
      </article>
    </div>

    <div v-else class="mt-6 rounded-2xl border border-amber-200/20 bg-amber-200/10 p-4">
      <p class="text-sm font-medium text-amber-100">
        Результат ще не опубліковано
      </p>
      <p class="mt-2 text-sm leading-6 text-zinc-300">
        Поверніться на цю сторінку пізніше. Коли організатор обере переможця, блок автоматично покаже результат.
      </p>
    </div>
  </section>
</template>
