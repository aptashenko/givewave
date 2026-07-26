import { createError, getRouterParam } from 'h3'
import { EntryEntity, GiveawayEntity, WinnerEntity } from '~~/server/db/entities'
import { useDataSource } from '~~/server/db/data-source'
import { serializePublicGiveaway, serializePublicWinner } from '~~/shared/utils/giveaway-public'
import { formatParticipantNumber } from '~~/shared/utils/giveaway-rules'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Не вказано slug розіграшу' })
  }

  const dataSource = await useDataSource()
  const giveawayRepository = dataSource.getRepository(GiveawayEntity)
  const giveaway = await giveawayRepository.findOneBy({ slug })

  if (!giveaway) {
    throw createError({ statusCode: 404, statusMessage: 'Розіграш не знайдено' })
  }

  const entryCount = await dataSource.getRepository(EntryEntity).countBy({ giveawayId: giveaway.id })
  const winners = await dataSource.getRepository(WinnerEntity).find({
    where: { giveawayId: giveaway.id },
    relations: ['entry'],
    order: { position: 'ASC' }
  })
  const orderedEntries = winners.length
    ? await dataSource.getRepository(EntryEntity).find({
        where: { giveawayId: giveaway.id },
        select: ['id'],
        order: { createdAt: 'ASC' }
      })
    : []
  const participantNumbers = new Map(
    orderedEntries.map((entry, index) => [entry.id, formatParticipantNumber(giveaway.slug, index + 1)])
  )

  return {
    giveaway: serializePublicGiveaway(giveaway),
    entryCount,
    winners: winners.map((winner) => serializePublicWinner(winner, participantNumbers.get(winner.entryId)))
  }
})
