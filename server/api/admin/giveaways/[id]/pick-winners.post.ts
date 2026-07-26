import { createError, getQuery, getRouterParam } from 'h3'
import { EntryEntity, GiveawayEntity, WinnerEntity } from '~~/server/db/entities'
import { useDataSource } from '~~/server/db/data-source'
import { getWinnerPickingBlockReason } from '~~/shared/utils/giveaway-rules'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const token = String(getQuery(event).token || '')

  if (!id || !token) {
    throw createError({ statusCode: 400, statusMessage: 'Не вказано admin-доступ' })
  }

  const dataSource = await useDataSource()

  return dataSource.transaction(async (manager) => {
    const giveawayRepository = manager.getRepository(GiveawayEntity)
    const giveaway = await giveawayRepository.findOneBy({ id, adminToken: token })

    if (!giveaway) {
      throw createError({ statusCode: 404, statusMessage: 'Розіграш не знайдено' })
    }

    const existingWinners = await manager.getRepository(WinnerEntity).find({
      where: { giveawayId: giveaway.id },
      relations: ['entry'],
      order: { position: 'ASC' }
    })

    if (existingWinners.length > 0) {
      return {
        giveaway: serializeGiveaway(giveaway),
        winners: existingWinners.map((winner) => ({
          id: winner.id,
          position: winner.position,
          entry: serializeEntry(winner.entry)
        }))
      }
    }

    const earlyBlockReason = getWinnerPickingBlockReason(giveaway, {
      entryCount: giveaway.winnersCount,
      existingWinnersCount: existingWinners.length
    })

    if (earlyBlockReason === 'registration-active') {
      throw createError({
        statusCode: 409,
        statusMessage: 'Обрати переможців можна тільки після завершення реєстрації'
      })
    }

    const entries = await manager.getRepository(EntryEntity).find({
      where: { giveawayId: giveaway.id }
    })

    const blockReason = getWinnerPickingBlockReason(giveaway, {
      entryCount: entries.length,
      existingWinnersCount: existingWinners.length
    })

    if (blockReason === 'not-enough-entries') {
      throw createError({
        statusCode: 409,
        statusMessage: `Потрібно щонайменше ${giveaway.winnersCount} заявок, щоб обрати переможців`
      })
    }

    if (blockReason === 'already-picked') {
      throw createError({
        statusCode: 409,
        statusMessage: 'Переможців уже обрано'
      })
    }

    const selectedEntries = [...entries]
      .sort(() => Math.random() - 0.5)
      .slice(0, giveaway.winnersCount)

    const winners = await manager.getRepository(WinnerEntity).save(
      selectedEntries.map((entry, index) => ({
        giveawayId: giveaway.id,
        entryId: entry.id,
        position: index + 1
      }))
    )

    giveaway.status = 'picked'
    giveaway.winnersPickedAt = new Date()
    await giveawayRepository.save(giveaway)

    return {
      giveaway: serializeGiveaway(giveaway),
      winners: winners.map((winner, index) => ({
        id: winner.id,
        position: winner.position,
        entry: serializeEntry(selectedEntries[index])
      }))
    }
  })
})

function serializeGiveaway(giveaway: any) {
  return {
    id: giveaway.id,
    slug: giveaway.slug,
    title: giveaway.title,
    prizeDescription: giveaway.prizeDescription,
    endsAt: giveaway.endsAt,
    winnersCount: giveaway.winnersCount,
    status: giveaway.status,
    winnersPickedAt: giveaway.winnersPickedAt,
    createdAt: giveaway.createdAt
  }
}

function serializeEntry(entry: any) {
  if (!entry) {
    return null
  }

  return {
    id: entry.id,
    name: entry.name,
    email: entry.email,
    handle: entry.handle,
    createdAt: entry.createdAt
  }
}
