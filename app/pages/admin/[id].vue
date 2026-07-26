<script setup lang="ts">
import { Copy, Download, ExternalLink, Loader2, Shuffle, Trophy, Users } from '@lucide/vue'
import { Badge as UiBadge } from '~/components/ui/badge'
import { Button as UiButton } from '~/components/ui/button'
import { Card as UiCard } from '~/components/ui/card'
import { Input as UiInput } from '~/components/ui/input'
import { buildEntriesCsv, createEntriesCsvFilename } from '~~/shared/utils/giveaway-csv'

const route = useRoute()
const id = computed(() => String(route.params.id))
const token = computed(() => String(route.query.token || ''))
const picking = ref(false)
const errorMessage = ref('')
const requestUrl = useRequestURL()
const now = ref<Date | null>(null)
let nowTimer: ReturnType<typeof setInterval> | undefined

const { data, pending, error, refresh } = await useFetch(() => `/api/admin/giveaways/${id.value}`, {
  query: { token }
})

const giveaway = computed(() => data.value?.giveaway)
const entries = computed(() => data.value?.entries || [])
const winners = computed(() => data.value?.winners || [])
const publicUrl = computed(() => giveaway.value ? `${requestUrl.origin}/g/${giveaway.value.slug}` : '')
const registrationEndsAt = computed(() => giveaway.value ? new Date(giveaway.value.endsAt) : null)
const hasRegistrationEnded = computed(() => {
  if (!registrationEndsAt.value || !now.value) {
    return false
  }

  return registrationEndsAt.value.getTime() <= now.value.getTime()
})
const pickDisabledReason = computed(() => {
  if (!giveaway.value) {
    return ''
  }

  if (winners.value.length > 0) {
    return 'Переможців уже обрано.'
  }

  if (!hasRegistrationEnded.value) {
    return 'Обрати переможців можна тільки після завершення реєстрації.'
  }

  if (entries.value.length < giveaway.value.winnersCount) {
    return `Потрібно щонайменше ${giveaway.value.winnersCount} заявок.`
  }

  return ''
})
const canPickWinners = computed(() => Boolean(giveaway.value && !picking.value && !pickDisabledReason.value))

onMounted(() => {
  now.value = new Date()
  nowTimer = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onBeforeUnmount(() => {
  if (nowTimer) {
    clearInterval(nowTimer)
  }
})

async function pickWinners() {
  if (!canPickWinners.value) {
    return
  }

  picking.value = true
  errorMessage.value = ''

  try {
    await $fetch(`/api/admin/giveaways/${id.value}/pick-winners`, {
      method: 'POST',
      query: { token: token.value }
    })
    await refresh()
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || error?.statusMessage || 'Не вдалося обрати переможців'
  } finally {
    picking.value = false
  }
}

async function copy(value: string) {
  await navigator.clipboard.writeText(value)
}

function exportEntriesCsv() {
  if (!giveaway.value || entries.value.length === 0) {
    return
  }

  const csv = buildEntriesCsv(entries.value)
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = createEntriesCsvFilename(giveaway.value.slug)
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <main class="min-h-screen px-4 py-8">
    <div class="mx-auto w-full max-w-6xl space-y-6">
      <div class="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <NuxtLink to="/" class="text-sm text-white underline text-muted-foreground hover:opacity-80">
            Створити інший розіграш
          </NuxtLink>
          <h1 class="mt-3 text-3xl text-white font-semibold md:text-5xl">
            Панель організатора
          </h1>
        </div>
      </div>

      <Card v-if="pending" class="flex min-h-64 items-center justify-center p-6">
        <Loader2 class="h-6 w-6 animate-spin text-primary" />
      </Card>

      <Card v-else-if="error" class="p-6">
        <Badge variant="secondary">Потрібне приватне посилання</Badge>
        <h2 class="mt-3 text-2xl font-semibold">
          Admin-сторінка розіграшу недоступна
        </h2>
      </Card>

      <template v-else-if="giveaway">
        <section class="grid gap-4 md:grid-cols-4">
          <Card class="p-4 md:col-span-2">
            <p class="text-sm text-muted-foreground">
              Розіграш
            </p>
            <h2 class="mt-1 text-2xl font-semibold">
              {{ giveaway.title }}
            </h2>
            <p class="mt-3 line-clamp-3 text-sm text-muted-foreground">
              {{ giveaway.prizeDescription }}
            </p>
          </Card>
          <Card class="p-4">
            <Users class="h-5 w-5 text-primary" />
            <p class="mt-3 text-3xl font-semibold">
              {{ entries.length }}
            </p>
            <p class="text-sm text-muted-foreground">
              Заявки
            </p>
          </Card>
          <Card class="p-4">
            <Trophy class="h-5 w-5 text-primary" />
            <p class="mt-3 text-3xl font-semibold">
              {{ giveaway.winnersCount }}
            </p>
            <p class="text-sm text-muted-foreground">
              Місця переможців
            </p>
          </Card>
        </section>

        <Card class="p-5">
          <div class="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 class="text-xl font-semibold">
                Публічне посилання
              </h2>
              <p class="text-sm text-muted-foreground">
                Поділіться цим URL з учасниками.
              </p>
            </div>
            <div class="flex w-full gap-2 md:w-[520px]">
              <UiInput :model-value="publicUrl" readonly />
              <UiButton size="icon" variant="outline" title="Скопіювати публічне посилання" @click="copy(publicUrl)">
                <Copy class="h-4 w-4" />
              </UiButton>
              <NuxtLink :to="publicUrl" target="_blank">
                <UiButton size="icon" variant="outline" title="Відкрити публічне посилання">
                  <ExternalLink class="h-4 w-4" />
                </UiButton>
              </NuxtLink>
            </div>
          </div>
        </Card>

        <Card class="p-5">
          <div class="flex flex-col justify-between gap-4 border-b pb-4 md:flex-row md:items-center">
            <div>
              <h2 class="text-xl font-semibold">
                Переможці
              </h2>
              <p class="text-sm text-muted-foreground">
                Результат вибору зберігається після першого запуску.
              </p>
            </div>
            <UiButton :disabled="!canPickWinners" @click="pickWinners">
              <Loader2 v-if="picking" class="h-4 w-4 animate-spin" />
              <Shuffle v-else class="h-4 w-4" />
              Обрати переможців
            </UiButton>
          </div>

          <p v-if="errorMessage" class="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {{ errorMessage }}
          </p>

          <p v-else-if="pickDisabledReason && winners.length === 0" class="mt-4 rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
            {{ pickDisabledReason }}
          </p>

          <div v-if="winners.length" class="mt-4 grid gap-3 md:grid-cols-2">
            <div v-for="winner in winners" :key="winner.id" class="rounded-md border p-3">
              <p class="text-sm text-muted-foreground">
                Переможець #{{ winner.position }}
              </p>
              <p class="font-medium">
                {{ winner.entry?.name }}
              </p>
              <p class="text-sm text-muted-foreground">
                {{ winner.entry?.email }}
              </p>
            </div>
          </div>

          <p v-else class="mt-4 text-sm text-muted-foreground">
            {{ pickDisabledReason || 'Переможців ще не обрано.' }}
          </p>
        </Card>

        <Card class="overflow-hidden">
          <div class="flex flex-col justify-between gap-4 border-b p-5 sm:flex-row sm:items-center">
            <div>
              <h2 class="text-xl font-semibold">
                Учасники
              </h2>
              <p class="text-sm text-muted-foreground">
                Нові заявки показані першими.
              </p>
            </div>
            <UiButton variant="outline" :disabled="entries.length === 0" @click="exportEntriesCsv">
              <Download class="h-4 w-4" />
              Експорт CSV
            </UiButton>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[680px] text-sm">
              <thead class="bg-muted text-left text-muted-foreground">
                <tr>
                  <th class="px-5 py-3 font-medium">Ім’я</th>
                  <th class="px-5 py-3 font-medium">Email</th>
                  <th class="px-5 py-3 font-medium">Username</th>
                  <th class="px-5 py-3 font-medium">Дата заявки</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in entries" :key="entry.id" class="border-t">
                  <td class="px-5 py-3 font-medium">{{ entry.name }}</td>
                  <td class="px-5 py-3">{{ entry.email }}</td>
                  <td class="px-5 py-3">{{ entry.handle || '-' }}</td>
                  <td class="px-5 py-3">{{ new Date(entry.createdAt).toLocaleString('uk-UA') }}</td>
                </tr>
                <tr v-if="entries.length === 0">
                  <td colspan="4" class="px-5 py-8 text-center text-muted-foreground">
                    Заявок поки немає.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </template>
    </div>
  </main>
</template>
