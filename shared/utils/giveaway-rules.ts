export interface GiveawayRuleState {
  status: string
  endsAt: Date | string
  winnersCount: number
}

export type WinnerPickingBlockReason = 'already-picked' | 'registration-active' | 'not-enough-entries'

export function isRegistrationOpen(giveaway: Pick<GiveawayRuleState, 'status' | 'endsAt'>, now = new Date()) {
  return giveaway.status === 'active' && toTimestamp(giveaway.endsAt) > now.getTime()
}

export function getWinnerPickingBlockReason(
  giveaway: GiveawayRuleState,
  counts: {
    entryCount: number
    existingWinnersCount: number
  },
  now = new Date()
): WinnerPickingBlockReason | null {
  if (giveaway.status === 'picked' || counts.existingWinnersCount > 0) {
    return 'already-picked'
  }

  if (toTimestamp(giveaway.endsAt) > now.getTime()) {
    return 'registration-active'
  }

  if (counts.entryCount < giveaway.winnersCount) {
    return 'not-enough-entries'
  }

  return null
}

export function formatParticipantNumber(value: string, number: number) {
  const prefix = value
    .replace(/[^a-z0-9]/gi, '')
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, 'G')

  return `${prefix}-${String(number).padStart(4, '0')}`
}

export function maskPublicWinnerName(name?: string | null, fallback = 'Учасник') {
  const normalizedName = name?.trim()

  if (!normalizedName) {
    return fallback
  }

  const parts = normalizedName.split(/\s+/).filter(Boolean)

  if (parts.length === 1) {
    return parts[0] || fallback
  }

  const firstName = parts[0]
  const lastName = parts[1]

  if (!firstName || !lastName) {
    return normalizedName
  }

  return `${firstName} ${lastName.slice(0, 1)}.`
}

function toTimestamp(value: Date | string) {
  return value instanceof Date ? value.getTime() : new Date(value).getTime()
}
