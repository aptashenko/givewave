export interface GiveawayCsvEntry {
  name: string
  email: string
  handle?: string | null
  createdAt: Date | string
}

export function buildEntriesCsv(entries: GiveawayCsvEntry[]) {
  const rows = [
    ['Name', 'Email', 'Telegram username', 'Registered at'],
    ...entries.map((entry) => [
      entry.name,
      entry.email,
      entry.handle || '',
      new Date(entry.createdAt).toISOString()
    ])
  ]

  return rows.map((row) => row.map(escapeCsvCell).join(',')).join('\n')
}

export function createEntriesCsvFilename(slug: string) {
  const normalizedSlug = slug.trim() || 'giveaway'

  return `${normalizedSlug}-participants.csv`
}

export function escapeCsvCell(value: unknown) {
  const text = String(value ?? '')

  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
