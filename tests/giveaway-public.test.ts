import assert from 'node:assert/strict'
import test from 'node:test'
import { serializePublicGiveaway, serializePublicWinner } from '../shared/utils/giveaway-public.js'

test('public giveaway serialization does not expose admin access fields', () => {
  const source = {
    id: 'giveaway-id',
    slug: 'summer-launch',
    adminToken: 'private-admin-token',
    title: 'Summer launch giveaway',
    description: 'Public description',
    prizeDescription: 'Prize',
    prizeEyebrow: null,
    organizerName: 'Organizer',
    organizerUrl: null,
    rulesUrl: null,
    termsUrl: null,
    privacyUrl: null,
    endsAt: '2026-08-15T12:00:00.000Z',
    winnersCount: 1,
    status: 'active',
    winnersPickedAt: null,
    createdAt: '2026-07-26T12:00:00.000Z'
  }

  const serialized = serializePublicGiveaway(source)

  assert.equal(Object.hasOwn(serialized, 'adminToken'), false)
  assert.equal(serialized.slug, 'summer-launch')
  assert.equal(serialized.title, 'Summer launch giveaway')
})

test('public winner serialization hides private participant contact and tracking fields', () => {
  const source = {
    id: 'winner-id',
    entryId: 'entry-id',
    position: 1,
    entry: {
      name: 'Олена Коваль',
      email: 'olena@example.com',
      handle: '@olena',
      ipHash: 'private-ip-hash',
      userAgentHash: 'private-user-agent-hash'
    }
  }

  const serialized = serializePublicWinner(source, 'SUM-0007')

  assert.deepEqual(serialized, {
    id: 'winner-id',
    position: 1,
    name: 'Олена Коваль',
    handle: '@olena',
    participantNumber: 'SUM-0007'
  })
  assert.equal(Object.hasOwn(serialized, 'email'), false)
  assert.equal(Object.hasOwn(serialized, 'ipHash'), false)
  assert.equal(Object.hasOwn(serialized, 'userAgentHash'), false)
  assert.equal(Object.hasOwn(serialized, 'entryId'), false)
})
