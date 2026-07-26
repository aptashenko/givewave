import { readBody } from 'h3'
import { createGiveawaySchema, type CreateGiveawayInput } from '~~/shared/schemas/giveaway'
import { GiveawayEntity } from '~~/server/db/entities'
import { useDataSource } from '~~/server/db/data-source'
import { adminGiveawayUrl, createAdminToken, createSlug, parseZodError, publicGiveawayUrl } from '~~/server/utils/giveaway'

export default defineEventHandler(async (event) => {
  let input: CreateGiveawayInput

  try {
    input = createGiveawaySchema.parse(await readBody(event))
  } catch (error) {
    parseZodError(error)
  }

  const dataSource = await useDataSource()
  const giveawayRepository = dataSource.getRepository(GiveawayEntity)
  const giveaway = giveawayRepository.create({
    slug: createSlug(input.title),
    adminToken: createAdminToken(),
    title: input.title,
    description: input.description,
    prizeDescription: input.prizeDescription,
    prizeEyebrow: input.prizeEyebrow || null,
    organizerName: input.organizerName,
    organizerUrl: input.organizerUrl || null,
    rulesUrl: input.rulesUrl || null,
    termsUrl: input.termsUrl || null,
    privacyUrl: input.privacyUrl || null,
    endsAt: input.endsAt,
    winnersCount: input.winnersCount,
    status: 'active'
  })

  const saved = await giveawayRepository.save(giveaway)

  return {
    giveaway: {
      id: saved.id,
      slug: saved.slug,
      title: saved.title,
      description: saved.description,
      prizeDescription: saved.prizeDescription,
      prizeEyebrow: saved.prizeEyebrow,
      organizerName: saved.organizerName,
      organizerUrl: saved.organizerUrl,
      rulesUrl: saved.rulesUrl,
      termsUrl: saved.termsUrl,
      privacyUrl: saved.privacyUrl,
      endsAt: saved.endsAt,
      winnersCount: saved.winnersCount,
      status: saved.status,
      createdAt: saved.createdAt
    },
    publicUrl: publicGiveawayUrl(saved.slug),
    adminUrl: adminGiveawayUrl(saved.id, saved.adminToken)
  }
})
