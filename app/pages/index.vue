<script setup lang="ts">
import {
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  Check,
  Copy,
  ExternalLink,
  FileText,
  Loader2,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  Users,
  X
} from '@lucide/vue'
import { Badge as UiBadge } from '~/components/ui/badge'
import { Button as UiButton } from '~/components/ui/button'
import { Card as UiCard } from '~/components/ui/card'
import { Input as UiInput } from '~/components/ui/input'
import { Label as UiLabel } from '~/components/ui/label'
import { Textarea as UiTextarea } from '~/components/ui/textarea'

const form = reactive({
  title: '',
  description: '',
  prizeDescription: '',
  prizeEyebrow: '',
  organizerName: '',
  organizerUrl: '',
  rulesUrl: '',
  termsUrl: '',
  privacyUrl: '',
  endsAt: '',
  winnersCount: 1
})
const pending = ref(false)
const errorMessage = ref('')
const result = ref<{ publicUrl: string, adminUrl: string } | null>(null)
const isCreateModalOpen = ref(false)
const isResultModalOpen = ref(false)
const createGiveawayEndpoint = '/api/giveaways' as string
const endsAtInput = ref<HTMLInputElement | null>(null)
const telegramUrl = 'https://t.me/aptashenko'

const processCards = [
  {
    title: 'Дані розіграшу',
    description: 'Вкажіть назву, приз, опис, організатора і дату завершення.',
    icon: FileText
  },
  {
    title: 'Зрозумілі правила',
    description: 'Учасники бачать умови, дедлайн і пояснення, як буде обрано переможця.',
    icon: ShieldCheck
  },
  {
    title: 'Готове посилання',
    description: 'Після створення скопіюйте публічне посилання і надішліть його аудиторії.',
    icon: ExternalLink
  }
]

const benefits = [
  'Публічна сторінка для учасників',
  'Приватне посилання для організатора',
  'Збір заявок і контактів',
  'Пояснення прозорого вибору переможця'
]

const launchOptions = [
  {
    title: 'Безкоштовний запуск',
    badge: 'Поточний формат',
    price: '0 €',
    description: 'Швидкий MVP для перевірки ідеї: створюєте сторінку, збираєте заявки і керуєте результатом через приватне посилання.',
    icon: Sparkles,
    cta: 'Створити розіграш',
    action: 'create',
    highlighted: false,
    features: [
      'Готовий дизайн сторінки розіграшу',
      'Форма реєстрації учасників',
      'Публічне і адмін-посилання',
      'Базове пояснення прозорого вибору'
    ]
  },
  {
    title: 'White-label під бренд',
    badge: 'Індивідуально',
    price: 'від запиту',
    description: 'Для брендів, інфлюенсерів і кампаній, де потрібен власний вигляд, механіка конкурсу або нестандартний сценарій.',
    icon: WandSparkles,
    cta: 'Обговорити в Telegram',
    action: 'telegram',
    highlighted: true,
    features: [
      'Ваш логотип, кольори і домен',
      'Індивідуальний дизайн сторінки',
      'Сценарій або тип конкурсу під задачу',
      'Додаткові блоки, правила і інтеграції'
    ]
  }
]

const isAnyModalOpen = computed(() => isCreateModalOpen.value || isResultModalOpen.value)

watch(isAnyModalOpen, (isOpen) => {
  if (import.meta.client) {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  }
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})

async function createGiveaway() {
  pending.value = true
  errorMessage.value = ''

  try {
    const endsAt = new Date(form.endsAt)

    if (!form.endsAt || Number.isNaN(endsAt.getTime())) {
      throw new Error('Вкажіть дату завершення розіграшу')
    }

    result.value = await $fetch<{ publicUrl: string, adminUrl: string }>(createGiveawayEndpoint, {
      method: 'POST',
      body: {
        ...form,
        endsAt: endsAt.toISOString()
      }
    })
    isCreateModalOpen.value = false
    isResultModalOpen.value = true
  } catch (error: any) {
    errorMessage.value = getRequestErrorMessage(error, 'Не вдалося створити розіграш')
  } finally {
    pending.value = false
  }
}

async function copy(value: string) {
  await navigator.clipboard.writeText(value)
}

function openCreateModal() {
  isCreateModalOpen.value = true
}

function closeCreateModal() {
  isCreateModalOpen.value = false
}

function closeResultModal() {
  isResultModalOpen.value = false
}

function openEndsAtPicker() {
  const input = endsAtInput.value

  if (!input) {
    return
  }

  input.focus()

  try {
    input.showPicker?.()
  } catch {
    input.focus()
  }
}

function getRequestErrorMessage(error: any, fallback: string) {
  return error?.data?.statusMessage
    || error?.data?.message
    || error?.statusMessage
    || fallback
}
</script>

<template>
  <main class="min-h-screen overflow-x-hidden bg-zinc-950 text-white selection:bg-violet-200 selection:text-zinc-950">
    <div class="bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.2),transparent_34%),linear-gradient(180deg,rgba(24,24,27,0.84),rgba(9,9,11,1)_46%)]">
      <header class="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <NuxtLink to="/" class="inline-flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300">
          <span class="grid h-10 w-10 place-items-center rounded-xl border border-violet-300/20 bg-violet-300/10 text-sm font-semibold text-violet-100 shadow-lg shadow-violet-950/30">
            G
          </span>
          <span class="text-sm font-semibold text-white">Giveaway Studio</span>
        </NuxtLink>
        <UiButton
          class="hidden rounded-xl bg-violet-200 text-zinc-950 hover:bg-white focus-visible:ring-violet-200 sm:inline-flex"
          @click="openCreateModal"
        >
          Створити розіграш
          <ArrowRight class="h-4 w-4" />
        </UiButton>
      </header>

      <section class="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl gap-10 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <div class="max-w-3xl">
          <h1 class="max-w-[11ch] lg:max-w-full text-[2.75rem] font-semibold leading-[0.98] tracking-normal text-white min-[360px]:max-w-[12ch] min-[360px]:text-5xl sm:max-w-[13ch] sm:text-6xl lg:text-6xl">
            Створіть сторінку розіграшу за кілька хвилин.
          </h1>
          <p class="mt-6 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
            Запустіть красиву публічну сторінку, збирайте заявки учасників і отримайте приватне посилання для керування конкурсом.
          </p>

          <div class="mt-8 grid gap-3 sm:flex">
            <UiButton
              class="h-12 rounded-xl bg-violet-200 px-6 text-base text-zinc-950 shadow-lg shadow-violet-950/30 hover:bg-white focus-visible:ring-violet-200"
              @click="openCreateModal"
            >
              Створити розіграш
              <ArrowRight class="h-4 w-4" />
            </UiButton>
            <a
              :href="telegramUrl"
              target="_blank"
              rel="noreferrer"
              class="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 text-base font-medium text-white transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
            >
              Написати в Telegram
              <ExternalLink class="h-4 w-4" />
            </a>
          </div>

          <div class="mt-10 grid gap-3 sm:grid-cols-2">
            <div
              v-for="item in benefits"
              :key="item"
              class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-zinc-300"
            >
              <ShieldCheck class="h-4 w-4 shrink-0 text-violet-200" />
              {{ item }}
            </div>
          </div>
        </div>

        <aside class="w-full h-full rounded-[1.75rem] border border-white/10 bg-zinc-950/75 p-5 shadow-2xl shadow-black/40 lg:max-w-xl lg:justify-self-end mb-auto">
          <div class="rounded-[1.35rem] h-full border border-white/10 bg-[radial-gradient(circle_at_24%_0%,rgba(168,85,247,0.28),transparent_34%),linear-gradient(145deg,rgba(39,39,42,0.96),rgba(9,9,11,0.96))] p-5">
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-violet-100">Приклад сторінки</p>
                <h2 class="mt-3 text-2xl font-semibold leading-tight text-white">
                  Виграйте вікенд у Барселоні
                </h2>
              </div>
              <div class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-200 text-zinc-950">
                <CalendarPlus class="h-5 w-5" />
              </div>
            </div>

            <p class="mt-4 text-sm leading-6 text-zinc-400">
              Учасник бачить приз, дедлайн, правила, кількість учасників і форму реєстрації.
            </p>

            <div class="mt-6 grid gap-3 sm:grid-cols-2">
              <div class="rounded-2xl border border-white/10 bg-black/20 p-4">
                <Users class="h-5 w-5 text-violet-200" />
                <p class="mt-3 text-2xl font-semibold text-white">1 248</p>
                <p class="text-sm text-zinc-500">учасників</p>
              </div>
              <div class="rounded-2xl border border-white/10 bg-black/20 p-4">
                <CalendarDays class="h-5 w-5 text-violet-200" />
                <p class="mt-3 text-2xl font-semibold text-white">15.08</p>
                <p class="text-sm text-zinc-500">дедлайн</p>
              </div>
            </div>

            <div class="mt-6 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
              <p class="text-sm font-medium text-emerald-100">
                Переможець не обирається вручну
              </p>
              <p class="mt-1 text-sm leading-6 text-zinc-400">
                Сторінка пояснює, як працює прозорий вибір після завершення реєстрації.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </div>

    <section class="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div class="max-w-2xl">
        <p class="text-sm font-medium uppercase tracking-[0.18em] text-violet-200">Як створити конкурс?</p>
        <h2 class="mt-3 text-3xl font-semibold text-white sm:text-4xl">
          Від ідеї до публічного посилання за три кроки.
        </h2>
      </div>

      <div class="mt-8 grid gap-3 md:grid-cols-3">
        <article
          v-for="item in processCards"
          :key="item.title"
          class="rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/10"
        >
          <component :is="item.icon" class="h-5 w-5 text-violet-200" />
          <h3 class="mt-4 text-base font-semibold text-white">
            {{ item.title }}
          </h3>
          <p class="mt-2 text-sm leading-6 text-zinc-400">
            {{ item.description }}
          </p>
        </article>
      </div>

      <section class="mt-14">
        <div class="max-w-2xl">
          <p class="text-sm font-medium uppercase tracking-[0.18em] text-violet-200">Варіанти запуску</p>
          <h2 class="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            Почніть безкоштовно або запустіть конкурс під свій бренд.
          </h2>
          <p class="mt-3 text-sm leading-6 text-zinc-400 sm:text-base">
            Для тесту ідеї достатньо стандартного формату. Якщо потрібен окремий досвід для аудиторії, можна зробити white-label сторінку з власною механікою.
          </p>
        </div>

        <div class="mt-8 grid gap-4 lg:grid-cols-2">
          <article
            v-for="option in launchOptions"
            :key="option.title"
            class="relative overflow-hidden rounded-[1.5rem] border p-5 shadow-2xl shadow-black/20 sm:p-6"
            :class="option.highlighted ? 'border-violet-200/30 bg-violet-200/[0.08]' : 'border-white/10 bg-white/[0.035]'"
          >
            <div
              v-if="option.highlighted"
              class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-200/70 to-transparent"
            />
            <div class="flex items-start justify-between gap-4">
              <div>
                <span
                  class="inline-flex rounded-full border px-3 py-1 text-xs font-medium"
                  :class="option.highlighted ? 'border-violet-200/30 bg-violet-200/10 text-violet-100' : 'border-white/10 bg-black/20 text-zinc-300'"
                >
                  {{ option.badge }}
                </span>
                <h3 class="mt-4 text-2xl font-semibold text-white">
                  {{ option.title }}
                </h3>
              </div>
              <div
                class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
                :class="option.highlighted ? 'bg-violet-200 text-zinc-950' : 'border border-white/10 bg-black/20 text-violet-200'"
              >
                <component :is="option.icon" class="h-5 w-5" />
              </div>
            </div>

            <p class="mt-5 text-3xl font-semibold tracking-normal text-white">
              {{ option.price }}
            </p>
            <p class="mt-3 text-sm leading-6 text-zinc-400">
              {{ option.description }}
            </p>

            <ul class="mt-6 space-y-3">
              <li
                v-for="feature in option.features"
                :key="feature"
                class="flex gap-3 text-sm leading-6 text-zinc-300"
              >
                <Check class="mt-0.5 h-4 w-4 shrink-0 text-violet-200" />
                <span>{{ feature }}</span>
              </li>
            </ul>

            <UiButton
              v-if="option.action === 'create'"
              class="mt-7 h-12 w-full rounded-xl bg-violet-200 text-base text-zinc-950 shadow-lg shadow-violet-950/30 hover:bg-white focus-visible:ring-violet-200"
              @click="openCreateModal"
            >
              {{ option.cta }}
              <ArrowRight class="h-4 w-4" />
            </UiButton>
            <a
              v-else
              :href="telegramUrl"
              target="_blank"
              rel="noreferrer"
              class="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-violet-200/30 bg-white/[0.06] px-5 text-base font-medium text-white transition hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
            >
              {{ option.cta }}
              <ExternalLink class="h-4 w-4" />
            </a>
          </article>
        </div>
      </section>

      <div class="mt-8 rounded-2xl border border-violet-200/20 bg-violet-200/[0.08] p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div>
          <p class="text-base font-semibold text-white">
            Чогось не вистачає?
          </p>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
            Якщо маєте питання, ідеї або пропозиції щодо сервісу, напишіть мені. Відкритий до зворотного зв’язку і допоможу розібратися з вашим конкурсом.
          </p>
        </div>
        <a
          :href="telegramUrl"
          target="_blank"
          rel="noreferrer"
          class="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-200 px-5 text-sm font-medium text-zinc-950 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 sm:mt-0 sm:w-auto"
        >
          Написати в Telegram
          <ExternalLink class="h-4 w-4" />
        </a>
      </div>
    </section>

    <Teleport to="body">
      <div
        v-if="isCreateModalOpen"
        class="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/95 px-4 py-6 backdrop-blur-sm sm:px-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-giveaway-title"
        @click.self="closeCreateModal"
        @keydown.esc="closeCreateModal"
      >
        <UiCard class="mx-auto w-full max-w-2xl border-white/10 bg-zinc-950 p-4 text-white shadow-2xl shadow-black/50 sm:p-6">
          <form class="space-y-5" @submit.prevent="createGiveaway">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h2 id="create-giveaway-title" class="text-xl font-semibold">
                  Створити новий розіграш
                </h2>
                <p class="text-sm text-zinc-400">
                  Контент, який буде показано на публічній сторінці.
                </p>
              </div>
              <UiButton
                type="button"
                size="icon"
                variant="ghost"
                class="shrink-0 rounded-xl text-zinc-300 hover:bg-white/10 hover:text-white"
                aria-label="Закрити форму"
                @click="closeCreateModal"
              >
                <X class="h-5 w-5" />
              </UiButton>
            </div>

            <div class="space-y-2">
              <UiLabel for="title" class="text-zinc-200">Назва <span class="text-rose-300">*</span></UiLabel>
              <UiInput id="title" v-model="form.title" required placeholder="Наприклад: Виграйте вікенд у Барселоні" class="border-white/10 bg-black/20 text-white placeholder:text-zinc-600 focus-visible:ring-violet-300" />
            </div>

            <div class="space-y-2">
              <UiLabel for="description" class="text-zinc-200">Короткий опис <span class="text-rose-300">*</span></UiLabel>
              <UiTextarea id="description" v-model="form.description" required placeholder="Коротко поясніть, що можна виграти і для кого цей розіграш." class="min-h-24 border-white/10 bg-black/20 text-white placeholder:text-zinc-600 focus-visible:ring-violet-300" />
            </div>

            <div class="space-y-2">
              <UiLabel for="prize" class="text-zinc-200">Приз <span class="text-rose-300">*</span></UiLabel>
              <UiTextarea id="prize" v-model="form.prizeDescription" required placeholder="Наприклад: Авіаквитки та дві ночі в готелі для двох людей." class="min-h-24 border-white/10 bg-black/20 text-white placeholder:text-zinc-600 focus-visible:ring-violet-300" />
            </div>

            <div class="grid gap-4 sm:grid-cols-[1fr_150px]">
              <div class="space-y-2">
                <UiLabel for="organizer" class="text-zinc-200">Організатор <span class="text-rose-300">*</span></UiLabel>
                <UiInput id="organizer" v-model="form.organizerName" required placeholder="Назва компанії або автора" class="border-white/10 bg-black/20 text-white placeholder:text-zinc-600 focus-visible:ring-violet-300" />
              </div>
              <div class="space-y-2">
                <UiLabel for="prizeEyebrow" class="text-zinc-200">Лейбл приза</UiLabel>
                <UiInput id="prizeEyebrow" v-model="form.prizeEyebrow" placeholder="Наприклад: Головний приз" class="border-white/10 bg-black/20 text-white placeholder:text-zinc-600 focus-visible:ring-violet-300" />
              </div>
            </div>

            <div class="grid gap-4 sm:grid-cols-[1fr_120px]">
              <div class="space-y-2">
                <UiLabel for="endsAt" class="text-zinc-200">Завершується <span class="text-rose-300">*</span></UiLabel>
                <div class="relative">
                  <input
                    id="endsAt"
                    ref="endsAtInput"
                    v-model="form.endsAt"
                    required
                    type="datetime-local"
                    class="dark-date-input flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 pr-10 text-sm text-white outline-none transition-colors focus-visible:ring-2 focus-visible:ring-violet-300"
                    @click="openEndsAtPicker"
                    @keydown.enter.prevent="openEndsAtPicker"
                  >
                  <button
                    type="button"
                    class="absolute right-1 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
                    aria-label="Відкрити календар"
                    @click="openEndsAtPicker"
                  >
                    <CalendarDays class="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div class="space-y-2">
                <UiLabel for="winners" class="text-zinc-200">Переможців <span class="text-rose-300">*</span></UiLabel>
                <UiInput id="winners" v-model="form.winnersCount" required type="number" min="1" max="25" class="border-white/10 bg-black/20 text-white focus-visible:ring-violet-300" />
              </div>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <UiLabel for="rulesUrl" class="text-zinc-200">Посилання на правила</UiLabel>
                <UiInput id="rulesUrl" v-model="form.rulesUrl" placeholder="#faq або https://..." class="border-white/10 bg-black/20 text-white placeholder:text-zinc-600 focus-visible:ring-violet-300" />
              </div>
              <div class="space-y-2">
                <UiLabel for="organizerUrl" class="text-zinc-200">Посилання організатора</UiLabel>
                <UiInput id="organizerUrl" v-model="form.organizerUrl" placeholder="https://your-site.com" class="border-white/10 bg-black/20 text-white placeholder:text-zinc-600 focus-visible:ring-violet-300" />
              </div>
              <div class="space-y-2">
                <UiLabel for="termsUrl" class="text-zinc-200">Посилання на умови</UiLabel>
                <UiInput id="termsUrl" v-model="form.termsUrl" placeholder="#terms або https://..." class="border-white/10 bg-black/20 text-white placeholder:text-zinc-600 focus-visible:ring-violet-300" />
              </div>
              <div class="space-y-2">
                <UiLabel for="privacyUrl" class="text-zinc-200">Посилання на приватність</UiLabel>
                <UiInput id="privacyUrl" v-model="form.privacyUrl" placeholder="#privacy або https://..." class="border-white/10 bg-black/20 text-white placeholder:text-zinc-600 focus-visible:ring-violet-300" />
              </div>
            </div>

            <p v-if="errorMessage" class="rounded-xl border border-rose-300/30 bg-rose-300/10 px-3 py-2 text-sm text-rose-200">
              {{ errorMessage }}
            </p>

            <UiButton type="submit" class="h-12 w-full rounded-xl bg-violet-200 text-base text-zinc-950 shadow-lg shadow-violet-950/30 hover:bg-white focus-visible:ring-violet-200" :disabled="pending">
              <Loader2 v-if="pending" class="h-4 w-4 animate-spin" />
              Створити розіграш
            </UiButton>
          </form>

        </UiCard>
      </div>

      <div
        v-if="isResultModalOpen && result"
        class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-zinc-950/95 px-4 py-6 backdrop-blur-sm sm:px-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="giveaway-links-title"
        @click.self="closeResultModal"
        @keydown.esc="closeResultModal"
      >
        <UiCard class="w-full max-w-xl border-white/10 bg-zinc-950 p-4 text-white shadow-2xl shadow-black/50 sm:p-6">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-300 text-zinc-950">
                <ShieldCheck class="h-6 w-6" />
              </div>
              <h2 id="giveaway-links-title" class="text-2xl font-semibold">
                Розіграш створено
              </h2>
              <p class="mt-2 text-sm leading-6 text-zinc-400">
                Збережіть обидва посилання. Публічне посилання потрібне для учасників, а адмін-посилання відкриває керування розіграшем.
              </p>
            </div>
            <UiButton
              type="button"
              size="icon"
              variant="ghost"
              class="shrink-0 rounded-xl text-zinc-300 hover:bg-white/10 hover:text-white"
              aria-label="Закрити вікно"
              @click="closeResultModal"
            >
              <X class="h-5 w-5" />
            </UiButton>
          </div>

          <div class="mt-6 space-y-4">
            <div class="space-y-2 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <p class="text-sm font-medium text-white">
                Публічне посилання
              </p>
              <p class="text-sm leading-6 text-zinc-400">
                Надішліть його людям, які мають взяти участь у розіграші.
              </p>
              <div class="flex gap-2">
                <UiInput :model-value="result.publicUrl" readonly class="border-white/10 bg-black/20 text-white" />
                <UiButton size="icon" variant="outline" class="border-white/10 bg-black/20 hover:bg-white/10" title="Скопіювати публічне посилання" @click="copy(result.publicUrl)">
                  <Copy class="h-4 w-4" />
                </UiButton>
                <a :href="result.publicUrl" target="_blank" rel="noreferrer">
                  <UiButton size="icon" variant="outline" class="border-white/10 bg-black/20 hover:bg-white/10" title="Відкрити публічне посилання">
                    <ExternalLink class="h-4 w-4" />
                  </UiButton>
                </a>
              </div>
            </div>

            <div class="space-y-2 rounded-2xl border border-amber-200/20 bg-amber-200/[0.08] p-4">
              <p class="text-sm font-medium text-amber-100">
                Адмін-посилання
              </p>
              <p class="text-sm leading-6 text-zinc-300">
                Збережіть його у безпечному місці. Без цього посилання ви не зможете керувати конкурсом.
              </p>
              <div class="flex gap-2">
                <UiInput :model-value="result.adminUrl" readonly class="border-white/10 bg-black/20 text-white" />
                <UiButton size="icon" variant="outline" class="border-white/10 bg-black/20 hover:bg-white/10" title="Скопіювати адмін-посилання" @click="copy(result.adminUrl)">
                  <Copy class="h-4 w-4" />
                </UiButton>
              </div>
            </div>
          </div>

          <UiButton
            type="button"
            class="mt-5 h-12 w-full rounded-xl bg-violet-200 text-base text-zinc-950 hover:bg-white focus-visible:ring-violet-200"
            @click="closeResultModal"
          >
            Я зберіг посилання
          </UiButton>
        </UiCard>
      </div>
    </Teleport>
  </main>
</template>
