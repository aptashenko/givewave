import { createError, getQuery, getRouterParam } from 'h3'
import { EntryEntity, GiveawayEntity, WinnerEntity } from '~~/server/db/entities'
import { useDataSource } from '~~/server/db/data-source'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const token = String(getQuery(event).token || '')

  if (!id || !token) {
    throw createError({ statusCode: 400, statusMessage: 'Не вказано admin-доступ' })
  }

  const dataSource = await useDataSource()
  const giveaway = await dataSource.getRepository(GiveawayEntity).findOneBy({ id, adminToken: token })

  if (!giveaway) {
    throw createError({ statusCode: 404, statusMessage: 'Розіграш не знайдено' })
  }

  const entries = await dataSource.getRepository(EntryEntity).find({
    where: { giveawayId: giveaway.id },
    order: { createdAt: 'DESC' }
  })
  const winners = await dataSource.getRepository(WinnerEntity).find({
    where: { giveawayId: giveaway.id },
    relations: ['entry'],
    order: { position: 'ASC' }
  })

  return {
    giveaway: {
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
    },
    entries: entries.map((entry) => ({
      id: entry.id,
      name: entry.name,
      email: entry.email,
      handle: entry.handle,
      createdAt: entry.createdAt
    })),
    winners: winners.map((winner) => ({
      id: winner.id,
      position: winner.position,
      entry: winner.entry && {
        id: winner.entry.id,
        name: winner.entry.name,
        email: winner.entry.email,
        handle: winner.entry.handle
      }
    }))
  }
})
