export interface PublicGiveawaySource {
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
  endsAt: Date | string
  winnersCount: number
  status: string
  winnersPickedAt: Date | string | null
  createdAt: Date | string
}

export interface PublicWinnerSource {
  id: string
  entryId: string
  position: number
  entry?: {
    name?: string | null
    handle?: string | null
  } | null
}

export function serializePublicGiveaway(giveaway: PublicGiveawaySource) {
  return {
    id: giveaway.id,
    slug: giveaway.slug,
    title: giveaway.title,
    description: giveaway.description,
    prizeDescription: giveaway.prizeDescription,
    prizeEyebrow: giveaway.prizeEyebrow,
    organizerName: giveaway.organizerName,
    organizerUrl: giveaway.organizerUrl,
    rulesUrl: giveaway.rulesUrl,
    termsUrl: giveaway.termsUrl,
    privacyUrl: giveaway.privacyUrl,
    endsAt: giveaway.endsAt,
    winnersCount: giveaway.winnersCount,
    status: giveaway.status,
    winnersPickedAt: giveaway.winnersPickedAt,
    createdAt: giveaway.createdAt
  }
}

export function serializePublicWinner(winner: PublicWinnerSource, participantNumber?: string) {
  return {
    id: winner.id,
    position: winner.position,
    name: winner.entry?.name || undefined,
    handle: winner.entry?.handle || null,
    participantNumber
  }
}
