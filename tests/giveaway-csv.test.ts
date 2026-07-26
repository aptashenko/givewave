import assert from 'node:assert/strict'
import test from 'node:test'
import { buildEntriesCsv, createEntriesCsvFilename, escapeCsvCell } from '../shared/utils/giveaway-csv.js'

test('entries CSV export includes expected columns and entry values', () => {
  const csv = buildEntriesCsv([
    {
      name: 'Олена Коваль',
      email: 'olena@example.com',
      handle: '@olena',
      createdAt: '2026-07-26T12:30:00.000Z'
    }
  ])

  assert.equal(csv, [
    'Name,Email,Telegram username,Registered at',
    'Олена Коваль,olena@example.com,@olena,2026-07-26T12:30:00.000Z'
  ].join('\n'))
})

test('entries CSV export escapes commas, quotes, and line breaks', () => {
  const csv = buildEntriesCsv([
    {
      name: 'Jane "JJ", Smith',
      email: 'jane@example.com',
      handle: '@jane\nsmith',
      createdAt: new Date('2026-07-26T12:30:00.000Z')
    }
  ])

  assert.equal(csv, [
    'Name,Email,Telegram username,Registered at',
    '"Jane ""JJ"", Smith",jane@example.com,"@jane\nsmith",2026-07-26T12:30:00.000Z'
  ].join('\n'))
})

test('entries CSV export leaves empty Telegram username cells empty', () => {
  const csv = buildEntriesCsv([
    {
      name: 'No Handle',
      email: 'no-handle@example.com',
      handle: null,
      createdAt: '2026-07-26T12:30:00.000Z'
    }
  ])

  assert.equal(csv.split('\n')[1], 'No Handle,no-handle@example.com,,2026-07-26T12:30:00.000Z')
})

test('CSV helpers create stable export filenames and escaped cells', () => {
  assert.equal(createEntriesCsvFilename('summer-launch'), 'summer-launch-participants.csv')
  assert.equal(createEntriesCsvFilename(''), 'giveaway-participants.csv')
  assert.equal(escapeCsvCell('plain'), 'plain')
  assert.equal(escapeCsvCell('a,b'), '"a,b"')
  assert.equal(escapeCsvCell('a"b'), '"a""b"')
})
