import { EntitySchema } from 'typeorm'

export type GiveawayStatus = 'active' | 'ended' | 'picked'

export interface Giveaway {
  id: string
  slug: string
  adminToken: string
  title: string
  description: string | null
  prizeDescription: string
  prizeEyebrow: string | null
  organizerName: string | null
  organizerUrl: string | null
  rulesUrl: string | null
  termsUrl: string | null
  privacyUrl: string | null
  endsAt: Date
  winnersCount: number
  status: GiveawayStatus
  winnersPickedAt: Date | null
  createdAt: Date
  entries?: Entry[]
  winners?: Winner[]
}

export interface Entry {
  id: string
  giveawayId: string
  name: string
  email: string
  handle: string | null
  ipHash: string | null
  userAgentHash: string | null
  createdAt: Date
  giveaway?: Giveaway
}

export interface Winner {
  id: string
  giveawayId: string
  entryId: string
  position: number
  createdAt: Date
  giveaway?: Giveaway
  entry?: Entry
}

export const GiveawayEntity = new EntitySchema<Giveaway>({
  name: 'Giveaway',
  tableName: 'giveaways',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    slug: { type: String, unique: true },
    adminToken: { type: String, name: 'admin_token', unique: true },
    title: { type: String },
    description: { type: 'text', nullable: true },
    prizeDescription: { type: 'text', name: 'prize_description' },
    prizeEyebrow: { type: String, name: 'prize_eyebrow', nullable: true },
    organizerName: { type: String, name: 'organizer_name', nullable: true },
    organizerUrl: { type: String, name: 'organizer_url', nullable: true },
    rulesUrl: { type: String, name: 'rules_url', nullable: true },
    termsUrl: { type: String, name: 'terms_url', nullable: true },
    privacyUrl: { type: String, name: 'privacy_url', nullable: true },
    endsAt: { type: 'timestamptz', name: 'ends_at' },
    winnersCount: { type: Number, name: 'winners_count' },
    status: { type: String, default: 'active' },
    winnersPickedAt: { type: 'timestamptz', name: 'winners_picked_at', nullable: true },
    createdAt: { type: 'timestamptz', name: 'created_at', createDate: true }
  },
  relations: {
    entries: {
      type: 'one-to-many',
      target: 'Entry',
      inverseSide: 'giveaway'
    },
    winners: {
      type: 'one-to-many',
      target: 'Winner',
      inverseSide: 'giveaway'
    }
  }
})

export const EntryEntity = new EntitySchema<Entry>({
  name: 'Entry',
  tableName: 'entries',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    giveawayId: { type: 'uuid', name: 'giveaway_id' },
    name: { type: String },
    email: { type: String },
    handle: { type: String, nullable: true },
    ipHash: { type: String, name: 'ip_hash', nullable: true },
    userAgentHash: { type: String, name: 'user_agent_hash', nullable: true },
    createdAt: { type: 'timestamptz', name: 'created_at', createDate: true }
  },
  uniques: [
    {
      name: 'UQ_entries_giveaway_email',
      columns: ['giveawayId', 'email']
    }
  ],
  relations: {
    giveaway: {
      type: 'many-to-one',
      target: 'Giveaway',
      joinColumn: { name: 'giveaway_id' },
      onDelete: 'CASCADE',
      inverseSide: 'entries'
    }
  }
})

export const WinnerEntity = new EntitySchema<Winner>({
  name: 'Winner',
  tableName: 'winners',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    giveawayId: { type: 'uuid', name: 'giveaway_id' },
    entryId: { type: 'uuid', name: 'entry_id' },
    position: { type: Number },
    createdAt: { type: 'timestamptz', name: 'created_at', createDate: true }
  },
  uniques: [
    {
      name: 'UQ_winners_giveaway_position',
      columns: ['giveawayId', 'position']
    },
    {
      name: 'UQ_winners_giveaway_entry',
      columns: ['giveawayId', 'entryId']
    }
  ],
  relations: {
    giveaway: {
      type: 'many-to-one',
      target: 'Giveaway',
      joinColumn: { name: 'giveaway_id' },
      onDelete: 'CASCADE',
      inverseSide: 'winners'
    },
    entry: {
      type: 'many-to-one',
      target: 'Entry',
      joinColumn: { name: 'entry_id' },
      onDelete: 'CASCADE'
    }
  }
})
