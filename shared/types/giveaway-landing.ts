export type GiveawayPublicState = 'active' | 'awaiting-result' | 'picked'

export interface GiveawayPublicWinner {
  id: string
  position: number
  name?: string
  handle?: string | null
  participantNumber?: string
}

export interface GiveawayLandingData {
  slug: string
  organizerName: string
  organizerUrl: string
  title: string
  description: string
  prize: string
  prizeEyebrow: string
  endDateIso: string
  endDateLabel: string
  participants: number
  winners: number
  status: string
  winnersPickedAt: string | null
  winnersPickedAtLabel: string | null
  publicWinners: GiveawayPublicWinner[]
  verification: {
    participantListHash: string
    seedSource: string
    seedAvailability: string
    formula: string
    sampleParticipantNumbers: string[]
  }
  rulesUrl: string
  termsUrl: string
  privacyUrl: string
}

export interface GiveawayLandingApiResponse {
  giveaway: {
    id: string
    slug: string
    title: string
    description: string | null
    prizeDescription: string
    prizeEyebrow: string | null
    organizerName: string | null
    organizerUrl: string | null
    rulesUrl: string | null
    termsUrl: string | null
    privacyUrl: string | null
    endsAt: string
    winnersCount: number
    status: string
    winnersPickedAt: string | null
    createdAt: string
  }
  entryCount: number
  winners: Array<{
    id: string
    position: number
    name?: string
    handle?: string | null
    participantNumber?: string
  }>
}
