import assert from 'node:assert/strict'
import test from 'node:test'
import { createEntrySchema, createGiveawaySchema } from '../shared/schemas/giveaway.js'

function validGiveawayInput() {
  return {
    title: 'Summer launch giveaway',
    description: 'Register for a chance to win a launch week prize.',
    prizeDescription: 'A premium weekend trip for two people.',
    prizeEyebrow: '',
    organizerName: 'Launch Team',
    organizerUrl: 'example.com',
    rulesUrl: '',
    termsUrl: '',
    privacyUrl: '',
    endsAt: new Date(Date.now() + 86_400_000).toISOString(),
    winnersCount: 1
  }
}

test('create giveaway schema accepts valid input and normalizes optional URL fields', () => {
  const parsed = createGiveawaySchema.parse(validGiveawayInput())

  assert.equal(parsed.organizerUrl, 'https://example.com')
  assert.equal(parsed.prizeEyebrow, undefined)
  assert.equal(parsed.rulesUrl, undefined)
})

test('create giveaway schema rejects a deadline in the past', () => {
  const result = createGiveawaySchema.safeParse({
    ...validGiveawayInput(),
    endsAt: '2000-01-01T00:00:00.000Z'
  })

  assert.equal(result.success, false)
})

test('create giveaway schema requires key public content fields', () => {
  const result = createGiveawaySchema.safeParse({
    ...validGiveawayInput(),
    title: '',
    description: 'Too short',
    prizeDescription: '',
    organizerName: ''
  })

  assert.equal(result.success, false)
})

test('create giveaway schema limits winners count to the supported range', () => {
  assert.equal(createGiveawaySchema.safeParse({ ...validGiveawayInput(), winnersCount: 0 }).success, false)
  assert.equal(createGiveawaySchema.safeParse({ ...validGiveawayInput(), winnersCount: 26 }).success, false)
  assert.equal(createGiveawaySchema.safeParse({ ...validGiveawayInput(), winnersCount: 25 }).success, true)
})

test('entry schema normalizes email and accepts empty optional Telegram handle', () => {
  const parsed = createEntrySchema.parse({
    name: 'Олена Коваль',
    email: 'OLENA@EXAMPLE.COM',
    handle: ''
  })

  assert.equal(parsed.email, 'olena@example.com')
  assert.equal(parsed.handle, '')
})

test('entry schema rejects invalid participant identity fields', () => {
  assert.equal(createEntrySchema.safeParse({ name: 'A', email: 'user@example.com' }).success, false)
  assert.equal(createEntrySchema.safeParse({ name: 'Valid Name', email: 'not-an-email' }).success, false)
})
