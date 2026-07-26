<script setup lang="ts">
import { CheckCircle2, Loader2, Send } from '@lucide/vue'
import { z } from 'zod'
import { Button as UiButton } from '~/components/ui/button'
import { Input as UiInput } from '~/components/ui/input'
import { Label as UiLabel } from '~/components/ui/label'
import type { GiveawayLandingData } from '~~/shared/types/giveaway-landing'

const props = defineProps<{
  giveaway: GiveawayLandingData
  canPersistEntries?: boolean
}>()

const schema = z.object({
  name: z.string().trim().min(2, 'Вкажіть ваше повне ім’я.'),
  email: z.string().trim().email('Вкажіть коректний email.'),
  telegram: z.string().trim().optional(),
  consent: z.boolean().refine((value) => value, 'Потрібно погодитися з правилами розіграшу.')
})

interface RegistrationForm {
  name: string
  email: string
  telegram: string
  consent: boolean
}
type FieldErrors = Partial<Record<keyof RegistrationForm, string>>

const form = reactive<RegistrationForm>({
  name: '',
  email: '',
  telegram: '',
  consent: false
})

const errors = ref<FieldErrors>({})
const isSubmitting = ref(false)
const participantNumber = computed(() => `${participantPrefix.value}-${String(props.giveaway.participants + 1).padStart(4, '0')}`)
const participantPrefix = computed(() => props.giveaway.slug
  .replace(/[^a-z0-9]/gi, '')
  .slice(0, 3)
  .toUpperCase()
  .padEnd(3, 'G'))
const isSubmitted = ref(false)
const submitError = ref('')

function validateForm() {
  const result = schema.safeParse(form)

  if (result.success) {
    errors.value = {}
    return true
  }

  errors.value = result.error.issues.reduce<FieldErrors>((acc, issue) => {
    const field = issue.path[0] as keyof RegistrationForm | undefined
    if (field && !acc[field]) {
      acc[field] = issue.message
    }
    return acc
  }, {})
  return false
}

function clearFieldError(field: keyof RegistrationForm) {
  if (errors.value[field]) {
    errors.value = { ...errors.value, [field]: undefined }
  }
}

async function submitForm() {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  submitError.value = ''

  try {
    if (props.canPersistEntries) {
      await $fetch(`/api/giveaways/${props.giveaway.slug}/entries`, {
        method: 'POST',
        body: {
          name: form.name,
          email: form.email,
          handle: form.telegram
        }
      })
    } else {
      await new Promise((resolve) => window.setTimeout(resolve, 850))
    }

    isSubmitted.value = true
  } catch (error: any) {
    submitError.value = error?.statusMessage || 'Не вдалося зареєструвати заявку. Спробуйте ще раз.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section id="registration" class="w-full min-w-0 max-w-[calc(100vw-2rem)] scroll-mt-6 rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/30 sm:max-w-none sm:p-6">
    <div v-if="isSubmitted" class="rounded-[1.35rem] border border-emerald-300/20 bg-emerald-300/10 p-6 text-center">
      <div class="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-300 text-zinc-950">
        <CheckCircle2 class="h-7 w-7" />
      </div>
      <h2 class="mt-5 text-2xl font-semibold text-white">
        Ви зареєстровані
      </h2>
      <p class="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-300">
        Ми зберегли вашу заявку на {{ giveaway.title }}. Збережіть номер учасника для перевірки.
      </p>
      <div class="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 text-left">
        <p class="text-sm font-medium text-white">
          Як дізнатися результат?
        </p>
        <p class="mt-2 text-sm leading-6 text-zinc-300">
          Розіграш відбудеться після завершення реєстрації: {{ giveaway.endDateLabel }}. Якщо ви переможете, організатор напише на email, який ви вказали у формі.
        </p>
        <p class="mt-2 text-sm leading-6 text-zinc-400">
          Якщо ви додали Telegram username, його можуть використати як додатковий спосіб зв’язку.
        </p>
      </div>
      <div class="mx-auto mt-5 w-fit rounded-2xl border border-white/10 bg-black/25 px-5 py-4">
        <p class="text-xs uppercase tracking-[0.18em] text-zinc-500">Номер учасника</p>
        <p class="mt-1 text-3xl font-semibold tracking-normal text-white">{{ participantNumber }}</p>
      </div>
    </div>

    <form v-else class="space-y-5" novalidate @submit.prevent="submitForm">
      <div>
        <p class="text-sm font-medium uppercase tracking-[0.18em] text-violet-200">Реєстрація</p>
        <h2 class="mt-2 text-2xl font-semibold text-white sm:text-3xl">
          Долучіться до розіграшу.
        </h2>
        <p class="mt-2 text-sm leading-6 text-zinc-400">
          Вкажіть email, до якого маєте доступ. Організатор зв’яжеться з переможцем після розіграшу.
        </p>
      </div>

      <div class="space-y-2">
        <UiLabel for="giveaway-name" class="text-zinc-200">Ім’я <span class="text-rose-300">*</span></UiLabel>
        <UiInput
          id="giveaway-name"
          v-model="form.name"
          autocomplete="name"
          placeholder="Олена Коваль"
          :aria-invalid="Boolean(errors.name)"
          aria-describedby="giveaway-name-error"
          class="h-12 rounded-xl border-white/10 bg-black/20 text-white placeholder:text-zinc-600 focus-visible:ring-violet-300"
          @update:model-value="clearFieldError('name')"
        />
        <p v-if="errors.name" id="giveaway-name-error" class="text-sm text-rose-300">
          {{ errors.name }}
        </p>
      </div>

      <div class="space-y-2">
        <UiLabel for="giveaway-email" class="text-zinc-200">Email <span class="text-rose-300">*</span></UiLabel>
        <UiInput
          id="giveaway-email"
          v-model="form.email"
          type="email"
          autocomplete="email"
          placeholder="olena@example.com"
          :aria-invalid="Boolean(errors.email)"
          aria-describedby="giveaway-email-error"
          class="h-12 rounded-xl border-white/10 bg-black/20 text-white placeholder:text-zinc-600 focus-visible:ring-violet-300"
          @update:model-value="clearFieldError('email')"
        />
        <p v-if="errors.email" id="giveaway-email-error" class="text-sm text-rose-300">
          {{ errors.email }}
        </p>
      </div>

      <div class="space-y-2">
        <UiLabel for="giveaway-telegram" class="text-zinc-200">Telegram username <span class="text-zinc-500">(необов’язково)</span></UiLabel>
        <UiInput
          id="giveaway-telegram"
          v-model="form.telegram"
          autocomplete="off"
          placeholder="@janesmith"
          class="h-12 rounded-xl border-white/10 bg-black/20 text-white placeholder:text-zinc-600 focus-visible:ring-violet-300"
        />
      </div>

      <div class="rounded-2xl border border-white/10 bg-black/20 p-4">
        <label class="flex cursor-pointer items-start gap-3 text-sm leading-6 text-zinc-300">
          <input
            v-model="form.consent"
            type="checkbox"
            class="mt-1 h-4 w-4 rounded border-white/20 bg-zinc-950 text-violet-300 focus:ring-2 focus:ring-violet-300"
            :aria-invalid="Boolean(errors.consent)"
            aria-describedby="giveaway-consent-error"
            @change="clearFieldError('consent')"
          >
          <span>
            Я погоджуюся з правилами розіграшу та дозволяю зв’язатися зі мною у разі перемоги. <span class="text-rose-300">*</span>
          </span>
        </label>
        <p v-if="errors.consent" id="giveaway-consent-error" class="mt-2 text-sm text-rose-300">
          {{ errors.consent }}
        </p>
      </div>

      <p v-if="submitError" class="rounded-xl border border-rose-300/30 bg-rose-300/10 px-3 py-2 text-sm text-rose-200">
        {{ submitError }}
      </p>

      <UiButton
        type="submit"
        class="h-12 w-full rounded-xl bg-violet-200 text-base text-zinc-950 shadow-lg shadow-violet-950/30 hover:bg-white focus-visible:ring-violet-200"
        :disabled="isSubmitting"
      >
        <Loader2 v-if="isSubmitting" class="h-4 w-4 animate-spin" />
        <Send v-else class="h-4 w-4" />
        {{ isSubmitting ? 'Реєструємо заявку' : 'Подати заявку' }}
      </UiButton>
    </form>
  </section>
</template>
