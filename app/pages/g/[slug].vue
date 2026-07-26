<script setup lang="ts">
import GiveawayDetails from '~/components/giveaway/GiveawayDetails.vue'
import GiveawayFaq from '~/components/giveaway/GiveawayFaq.vue'
import GiveawayFooter from '~/components/giveaway/GiveawayFooter.vue'
import GiveawayHeader from '~/components/giveaway/GiveawayHeader.vue'
import GiveawayHero from '~/components/giveaway/GiveawayHero.vue'
import GiveawayRegistrationForm from '~/components/giveaway/GiveawayRegistrationForm.vue'
import GiveawayResult from '~/components/giveaway/GiveawayResult.vue'
import GiveawaySteps from '~/components/giveaway/GiveawaySteps.vue'
import GiveawayTrustList from '~/components/giveaway/GiveawayTrustList.vue'
import GiveawayVerification from '~/components/giveaway/GiveawayVerification.vue'
import type { GiveawayLandingApiResponse, GiveawayLandingData, GiveawayPublicState } from '~~/shared/types/giveaway-landing'
import { formatParticipantNumber } from '~~/shared/utils/giveaway-rules'

const route = useRoute()
const slug = computed(() => String(route.params.slug || 'barcelona-weekend'))
const now = ref<Date | null>(null)
let nowTimer: ReturnType<typeof setInterval> | undefined

const { data: apiData } = await useFetch<GiveawayLandingApiResponse>(() => `/api/giveaways/${slug.value}`, {
  key: () => `public-giveaway-${slug.value}`,
  retry: false
})

const apiGiveaway = computed(() => apiData.value?.giveaway || null)
const entryCount = computed(() => apiData.value?.entryCount || 0)
const publicWinners = computed(() => apiData.value?.winners || [])

const demoGiveaway = computed<GiveawayLandingData>(() => ({
  slug: 'barcelona-weekend',
  organizerName: 'Barcelona Weekend Club',
  organizerUrl: '#organizer',
  title: 'Виграйте вікенд у Барселоні',
  description: 'Зареєструйтеся, щоб отримати шанс виграти дводенну подорож для двох.',
  prize: 'Авіаквитки та дві ночі в готелі для двох людей.',
  prizeEyebrow: 'Головний приз',
  endDateIso: '2026-08-15T21:59:59.000Z',
  endDateLabel: '15 серпня 2026',
  participants: 1248,
  winners: 1,
  status: 'active',
  winnersPickedAt: null,
  winnersPickedAtLabel: null,
  publicWinners: [],
  verification: {
    participantListHash: 'sha256:7f8a9f6d3cc53ec4b6ef4e55e79f9d1a04bf8f15f1ec11a4757f2c21bb9a7d64',
    seedSource: 'Публічне випадкове число з Bitcoin після 15 серпня 2026, 22:00 UTC',
    seedAvailability: 'Його точне значення невідоме до завершення реєстрації.',
    formula: 'winnerIndex = sha256(participantListHash + publicSeed) % participantCount',
    sampleParticipantNumbers: ['BCN-1246', 'BCN-1247', 'BCN-1248', 'BCN-1249']
  },
  rulesUrl: '#faq',
  termsUrl: '#terms',
  privacyUrl: '#privacy'
}))

const giveaway = computed<GiveawayLandingData>(() => {
  const source = apiGiveaway.value

  if (!source) {
    return { ...demoGiveaway.value, slug: slug.value }
  }

  const endDate = new Date(source.endsAt)
  const endDateLabel = new Intl.DateTimeFormat('uk-UA', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(endDate)
  const seedDateLabel = new Intl.DateTimeFormat('uk-UA', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short'
  }).format(endDate)
  const winnersPickedAt = source.winnersPickedAt ? new Date(source.winnersPickedAt) : null
  const winnersPickedAtLabel = winnersPickedAt
    ? new Intl.DateTimeFormat('uk-UA', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
      }).format(winnersPickedAt)
    : null
  const nextParticipant = entryCount.value + 1
  const participantHash = source.status === 'active'
    ? 'Буде опубліковано після завершення реєстрації'
    : `sha256:${createStableHash(source.slug)}`

  return {
    slug: source.slug,
    organizerName: source.organizerName || 'Організатор розіграшу',
    organizerUrl: source.organizerUrl || '#organizer',
    title: source.title,
    description: source.description || source.prizeDescription,
    prize: source.prizeDescription,
    prizeEyebrow: source.prizeEyebrow || 'Головний приз',
    endDateIso: endDate.toISOString(),
    endDateLabel,
    participants: entryCount.value,
    winners: source.winnersCount,
    status: source.status,
    winnersPickedAt: source.winnersPickedAt,
    winnersPickedAtLabel,
    publicWinners: publicWinners.value,
    verification: {
      participantListHash: participantHash,
      seedSource: `Публічне випадкове число з Bitcoin після ${seedDateLabel}`,
      seedAvailability: 'Його точне значення невідоме до завершення реєстрації.',
      formula: 'winnerIndex = sha256(participantListHash + publicSeed) % participantCount',
      sampleParticipantNumbers: [
        formatParticipantNumber(source.slug, nextParticipant),
        formatParticipantNumber(source.slug, nextParticipant + 1),
        formatParticipantNumber(source.slug, nextParticipant + 2),
        formatParticipantNumber(source.slug, nextParticipant + 3)
      ]
    },
    rulesUrl: source.rulesUrl || '#faq',
    termsUrl: source.termsUrl || '#terms',
    privacyUrl: source.privacyUrl || '#privacy'
  }
})

const publicState = computed<GiveawayPublicState>(() => {
  if (giveaway.value.publicWinners.length > 0 || giveaway.value.status === 'picked') {
    return 'picked'
  }

  if (!now.value) {
    return 'active'
  }

  return new Date(giveaway.value.endDateIso).getTime() <= now.value.getTime()
    ? 'awaiting-result'
    : 'active'
})

const canRegister = computed(() => publicState.value === 'active')

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

useHead(() => ({
  title: `${giveaway.value.title} | Giveaway Studio`,
  meta: [
    {
      name: 'description',
      content: giveaway.value.description
    }
  ]
}))

function scrollToRegistration() {
  document.getElementById('registration')?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'start'
  })
}

function createStableHash(value: string) {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  const fragment = (hash >>> 0).toString(16).padStart(8, '0')
  return `${fragment}${fragment}${fragment}${fragment}${fragment}${fragment}${fragment}${fragment}`
}

</script>

<template>
  <main class="min-h-screen overflow-x-hidden bg-zinc-950 text-white selection:bg-violet-200 selection:text-zinc-950">
    <div class="bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.22),transparent_34%),linear-gradient(180deg,rgba(24,24,27,0.78),rgba(9,9,11,1)_42%)]">
      <GiveawayHeader :giveaway="giveaway" />
      <GiveawayHero :giveaway="giveaway" @participate="scrollToRegistration" />
    </div>

    <GiveawayTrustList />
    <GiveawaySteps />
    <GiveawayVerification :giveaway="giveaway" />

    <section class="mx-auto grid w-full max-w-7xl min-w-0 gap-5 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(320px,0.55fr)] lg:px-8">
      <GiveawayRegistrationForm v-if="canRegister" :giveaway="giveaway" :can-persist-entries="Boolean(apiGiveaway)" />
      <GiveawayResult v-else :giveaway="giveaway" :state="publicState" :winners="giveaway.publicWinners" />
      <GiveawayDetails :giveaway="giveaway" />
    </section>

    <div id="faq">
      <GiveawayFaq />
    </div>

    <GiveawayFooter :giveaway="giveaway" />
  </main>
</template>
