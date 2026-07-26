import { z } from 'zod'

const optionalText = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return value
  }

  const trimmed = value.trim()
  return trimmed || undefined
}, z.string().max(300).optional())

const optionalUrl = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return value
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return undefined
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}, z.string().url('Вкажіть коректне посилання').max(300).optional())

export const createGiveawaySchema = z.object({
  title: z.string().trim().min(3, 'Вкажіть назву розіграшу').max(120),
  description: z.string().trim().min(10, 'Опис має містити щонайменше 10 символів').max(500),
  prizeDescription: z.string().trim().min(3, 'Опишіть приз').max(1000),
  prizeEyebrow: optionalText,
  organizerName: z.string().trim().min(2, 'Вкажіть організатора').max(120),
  organizerUrl: optionalUrl,
  rulesUrl: optionalText,
  termsUrl: optionalText,
  privacyUrl: optionalText,
  endsAt: z.coerce.date().refine((date) => date.getTime() > Date.now(), 'Дата завершення має бути в майбутньому'),
  winnersCount: z.coerce.number().int().min(1).max(25)
})

export const createEntrySchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160).toLowerCase(),
  handle: z.string().trim().max(80).optional().or(z.literal(''))
})

export const adminTokenSchema = z.object({
  token: z.string().trim().min(16)
})

export type CreateGiveawayInput = z.infer<typeof createGiveawaySchema>
export type CreateEntryInput = z.infer<typeof createEntrySchema>
