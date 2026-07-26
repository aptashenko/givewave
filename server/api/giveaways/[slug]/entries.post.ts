import { createError, getRequestIP, getRequestHeader, getRouterParam, readBody } from 'h3'
import { createEntrySchema, type CreateEntryInput } from '~~/shared/schemas/giveaway'
import { EntryEntity, GiveawayEntity } from '~~/server/db/entities'
import { useDataSource } from '~~/server/db/data-source'
import { hashValue, parseZodError } from '~~/server/utils/giveaway'
import { isRegistrationOpen } from '~~/shared/utils/giveaway-rules'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Не вказано slug розіграшу' })
  }

  let input: CreateEntryInput

  try {
    input = createEntrySchema.parse(await readBody(event))
  } catch (error) {
    parseZodError(error)
  }

  const dataSource = await useDataSource()
  const giveaway = await dataSource.getRepository(GiveawayEntity).findOneBy({ slug })

  if (!giveaway) {
    throw createError({ statusCode: 404, statusMessage: 'Розіграш не знайдено' })
  }

  if (!isRegistrationOpen(giveaway)) {
    throw createError({ statusCode: 409, statusMessage: 'Цей розіграш уже завершився' })
  }

  const entryRepository = dataSource.getRepository(EntryEntity)

  try {
    const entry = entryRepository.create({
      giveawayId: giveaway.id,
      name: input.name,
      email: input.email,
      handle: input.handle || null,
      ipHash: hashValue(getRequestIP(event, { xForwardedFor: true })),
      userAgentHash: hashValue(getRequestHeader(event, 'user-agent'))
    })

    const saved = await entryRepository.save(entry)

    return {
      entry: {
        id: saved.id,
        name: saved.name,
        handle: saved.handle,
        createdAt: saved.createdAt
      }
    }
  } catch (error: any) {
    if (error?.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'Цей email уже зареєстровано' })
    }

    throw error
  }
})
