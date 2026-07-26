import { createHash, randomBytes } from 'node:crypto'
import { ZodError } from 'zod'

export function createSlug(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48)

  return `${base || 'giveaway'}-${randomBytes(4).toString('hex')}`
}

export function createAdminToken() {
  return randomBytes(24).toString('hex')
}

export function hashValue(value: string | undefined | null) {
  if (!value) {
    return null
  }

  return createHash('sha256').update(value).digest('hex')
}

export function parseZodError(error: unknown): never {
  if (!(error instanceof ZodError)) {
    throw error
  }

  throw createError({
    statusCode: 400,
    statusMessage: error.issues[0]?.message || 'Некоректні дані запиту'
  })
}

export function publicGiveawayUrl(slug: string) {
  const appUrl = useRuntimeConfig().public.appUrl.replace(/\/$/, '')
  return `${appUrl}/g/${slug}`
}

export function adminGiveawayUrl(id: string, token: string) {
  const appUrl = useRuntimeConfig().public.appUrl.replace(/\/$/, '')
  return `${appUrl}/admin/${id}?token=${token}`
}
