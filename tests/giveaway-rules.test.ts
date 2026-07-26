import assert from 'node:assert/strict'
import test from 'node:test'
import {
  formatParticipantNumber,
  getWinnerPickingBlockReason,
  isRegistrationOpen,
  maskPublicWinnerName
} from '../shared/utils/giveaway-rules.js'

const now = new Date('2026-07-26T12:00:00.000Z')
const beforeDeadline = '2026-07-27T12:00:00.000Z'
const afterDeadline = '2026-07-25T12:00:00.000Z'

test('registration is open only for active giveaways before the deadline', () => {
  assert.equal(isRegistrationOpen({ status: 'active', endsAt: beforeDeadline }, now), true)
  assert.equal(isRegistrationOpen({ status: 'active', endsAt: afterDeadline }, now), false)
  assert.equal(isRegistrationOpen({ status: 'picked', endsAt: beforeDeadline }, now), false)
})

test('winner picking is blocked while registration is still active', () => {
  const reason = getWinnerPickingBlockReason(
    { status: 'active', endsAt: beforeDeadline, winnersCount: 1 },
    { entryCount: 10, existingWinnersCount: 0 },
    now
  )

  assert.equal(reason, 'registration-active')
})

test('winner picking is blocked when there are not enough entries', () => {
  const reason = getWinnerPickingBlockReason(
    { status: 'active', endsAt: afterDeadline, winnersCount: 2 },
    { entryCount: 1, existingWinnersCount: 0 },
    now
  )

  assert.equal(reason, 'not-enough-entries')
})

test('winner picking is allowed after the deadline when enough entries exist', () => {
  const reason = getWinnerPickingBlockReason(
    { status: 'active', endsAt: afterDeadline, winnersCount: 2 },
    { entryCount: 3, existingWinnersCount: 0 },
    now
  )

  assert.equal(reason, null)
})

test('winner picking cannot run again after winners were selected', () => {
  assert.equal(
    getWinnerPickingBlockReason(
      { status: 'active', endsAt: afterDeadline, winnersCount: 1 },
      { entryCount: 10, existingWinnersCount: 1 },
      now
    ),
    'already-picked'
  )
  assert.equal(
    getWinnerPickingBlockReason(
      { status: 'picked', endsAt: afterDeadline, winnersCount: 1 },
      { entryCount: 10, existingWinnersCount: 0 },
      now
    ),
    'already-picked'
  )
})

test('participant numbers are stable and sequential', () => {
  assert.equal(formatParticipantNumber('barcelona-weekend', 1), 'BAR-0001')
  assert.equal(formatParticipantNumber('new', 27), 'NEW-0027')
  assert.equal(formatParticipantNumber('x', 8), 'XGG-0008')
})

test('public winner names do not expose full surnames', () => {
  assert.equal(maskPublicWinnerName('Олена Коваль'), 'Олена К.')
  assert.equal(maskPublicWinnerName('Oleh'), 'Oleh')
  assert.equal(maskPublicWinnerName('', 'Учасник BCN-0003'), 'Учасник BCN-0003')
})
