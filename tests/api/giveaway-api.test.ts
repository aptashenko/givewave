import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { DataSource } from 'typeorm'
import { EntryEntity, GiveawayEntity, WinnerEntity } from '../../server/db/entities.js'

interface CreateGiveawayResponse {
  giveaway: {
    id: string
    slug: string
    title: string
    status: string
    winnersCount: number
  }
  publicUrl: string
  adminUrl: string
}

interface EntryResponse {
  entry: {
    id: string
    name: string
    handle: string | null
    createdAt: string
  }
}

interface PickWinnersResponse {
  giveaway: {
    id: string
    status: string
    winnersPickedAt: string | null
  }
  winners: Array<{
    id: string
    position: number
    entry: {
      id: string
      email: string
    } | null
  }>
}

const baseUrl = process.env.GIVEAWAY_TEST_BASE_URL?.replace(/\/$/, '')
const databaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
const canRunApiTests = Boolean(baseUrl && databaseUrl)
const createdGiveawayIds: string[] = []

let dataSource: DataSource | null = null

after(async () => {
  if (!dataSource?.isInitialized) {
    return
  }

  for (const giveawayId of createdGiveawayIds.reverse()) {
    await dataSource.getRepository(WinnerEntity).delete({ giveawayId })
    await dataSource.getRepository(EntryEntity).delete({ giveawayId })
    await dataSource.getRepository(GiveawayEntity).delete({ id: giveawayId })
  }

  await dataSource.destroy()
})

apiTest('POST /api/giveaways creates a giveaway and returns public/admin links', async () => {
  const created = await createGiveaway('API create flow')
  const giveaway = await getGiveawayById(created.giveaway.id)

  assert.equal(giveaway.title, 'API create flow')
  assert.equal(giveaway.status, 'active')
  assert.equal(created.publicUrl.includes(`/g/${created.giveaway.slug}`), true)
  assert.equal(created.adminUrl.includes(`/admin/${created.giveaway.id}?token=`), true)
  assert.equal(created.publicUrl.includes('token='), false)
  assert.equal(created.publicUrl.includes('admin'), false)
  assert.notEqual(created.giveaway.slug, 'api-create-flow')
})

apiTest('participant registration saves entries, blocks duplicate email, and closes after deadline', async () => {
  const firstGiveaway = await createGiveaway('API registration flow')
  const firstEntry = await registerEntry(firstGiveaway.giveaway.slug, {
    name: 'Олена Коваль',
    email: 'OLENA@EXAMPLE.COM',
    handle: '@olena'
  })
  const savedEntry = await getEntryById(firstEntry.entry.id)

  assert.equal(savedEntry.email, 'olena@example.com')
  assert.equal(savedEntry.handle, '@olena')

  const duplicateResponse = await postJson(`/api/giveaways/${firstGiveaway.giveaway.slug}/entries`, {
    name: 'Олена Коваль',
    email: 'olena@example.com'
  })

  assert.equal(duplicateResponse.status, 409)

  const secondGiveaway = await createGiveaway('API registration same email allowed in another giveaway')
  const secondEntry = await registerEntry(secondGiveaway.giveaway.slug, {
    name: 'Олена Коваль',
    email: 'olena@example.com'
  })

  assert.equal(Boolean(secondEntry.entry.id), true)

  await endGiveaway(firstGiveaway.giveaway.id)

  const lateResponse = await postJson(`/api/giveaways/${firstGiveaway.giveaway.slug}/entries`, {
    name: 'Late User',
    email: 'late@example.com'
  })

  assert.equal(lateResponse.status, 409)
})

apiTest('winner picking blocks early/insufficient attempts, then saves and reuses winners', async () => {
  const earlyGiveaway = await createGiveaway('API early pick flow')
  await registerEntry(earlyGiveaway.giveaway.slug, {
    name: 'Early User',
    email: 'early@example.com'
  })

  const earlyToken = getAdminToken(earlyGiveaway.adminUrl)
  const earlyPick = await postJson(`/api/admin/giveaways/${earlyGiveaway.giveaway.id}/pick-winners?token=${earlyToken}`, {})

  assert.equal(earlyPick.status, 409)

  const insufficientGiveaway = await createGiveaway('API insufficient pick flow', { winnersCount: 2 })
  await registerEntry(insufficientGiveaway.giveaway.slug, {
    name: 'Single User',
    email: 'single@example.com'
  })
  await endGiveaway(insufficientGiveaway.giveaway.id)

  const insufficientToken = getAdminToken(insufficientGiveaway.adminUrl)
  const insufficientPick = await postJson(`/api/admin/giveaways/${insufficientGiveaway.giveaway.id}/pick-winners?token=${insufficientToken}`, {})

  assert.equal(insufficientPick.status, 409)

  const pickableGiveaway = await createGiveaway('API successful pick flow')
  await registerEntry(pickableGiveaway.giveaway.slug, {
    name: 'Winner One',
    email: 'winner-one@example.com'
  })
  await registerEntry(pickableGiveaway.giveaway.slug, {
    name: 'Winner Two',
    email: 'winner-two@example.com'
  })
  await endGiveaway(pickableGiveaway.giveaway.id)

  const pickableToken = getAdminToken(pickableGiveaway.adminUrl)
  const firstPick = await postJson<PickWinnersResponse>(
    `/api/admin/giveaways/${pickableGiveaway.giveaway.id}/pick-winners?token=${pickableToken}`,
    {}
  )

  assert.equal(firstPick.status, 200)
  assert.equal(firstPick.body.giveaway.status, 'picked')
  assert.equal(firstPick.body.winners.length, 1)

  const savedWinners = await getDataSource().then((source) => source.getRepository(WinnerEntity).findBy({
    giveawayId: pickableGiveaway.giveaway.id
  }))
  const savedGiveaway = await getGiveawayById(pickableGiveaway.giveaway.id)

  assert.equal(savedWinners.length, 1)
  assert.equal(savedGiveaway.status, 'picked')

  const secondPick = await postJson<PickWinnersResponse>(
    `/api/admin/giveaways/${pickableGiveaway.giveaway.id}/pick-winners?token=${pickableToken}`,
    {}
  )

  assert.equal(secondPick.status, 200)
  assert.equal(secondPick.body.winners[0]?.id, firstPick.body.winners[0]?.id)
  assert.equal(secondPick.body.winners[0]?.entry?.id, firstPick.body.winners[0]?.entry?.id)
})

function apiTest(name: string, fn: () => Promise<void>) {
  test(name, {
    skip: canRunApiTests
      ? false
      : 'Set GIVEAWAY_TEST_BASE_URL and TEST_DATABASE_URL to run API integration tests'
  }, fn)
}

async function createGiveaway(title: string, overrides: Partial<{ winnersCount: number }> = {}) {
  const response = await postJson<CreateGiveawayResponse>('/api/giveaways', {
    title,
    description: 'Integration test giveaway with enough public copy.',
    prizeDescription: 'A test prize for the integration suite.',
    organizerName: 'Integration Tests',
    endsAt: new Date(Date.now() + 86_400_000).toISOString(),
    winnersCount: overrides.winnersCount || 1
  })

  assert.equal(response.status, 200)
  createdGiveawayIds.push(response.body.giveaway.id)

  return response.body
}

async function registerEntry(slug: string, body: { name: string, email: string, handle?: string }) {
  const response = await postJson<EntryResponse>(`/api/giveaways/${slug}/entries`, body)

  assert.equal(response.status, 200)

  return response.body
}

async function postJson<TBody = unknown>(path: string, body: unknown) {
  assert.ok(baseUrl)

  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  const responseText = await response.text()
  const parsedBody = responseText ? JSON.parse(responseText) as TBody : undefined as TBody

  return {
    status: response.status,
    body: parsedBody
  }
}

async function getDataSource() {
  assert.ok(databaseUrl)

  if (dataSource?.isInitialized) {
    return dataSource
  }

  dataSource = new DataSource({
    type: 'postgres',
    url: databaseUrl,
    entities: [GiveawayEntity, EntryEntity, WinnerEntity],
    synchronize: false,
    logging: false
  })

  return dataSource.initialize()
}

async function getGiveawayById(id: string) {
  const source = await getDataSource()
  const giveaway = await source.getRepository(GiveawayEntity).findOneBy({ id })

  assert.ok(giveaway)

  return giveaway
}

async function getEntryById(id: string) {
  const source = await getDataSource()
  const entry = await source.getRepository(EntryEntity).findOneBy({ id })

  assert.ok(entry)

  return entry
}

async function endGiveaway(id: string) {
  const source = await getDataSource()

  await source.getRepository(GiveawayEntity).update({ id }, {
    endsAt: new Date(Date.now() - 60_000)
  })
}

function getAdminToken(adminUrl: string) {
  return new URL(adminUrl).searchParams.get('token') || ''
}
