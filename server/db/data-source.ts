import { DataSource } from 'typeorm'
import { EntryEntity, GiveawayEntity, WinnerEntity } from './entities'

let dataSource: DataSource | null = null

export async function useDataSource() {
  if (dataSource?.isInitialized) {
    return dataSource
  }

  const config = useRuntimeConfig()

  if (!config.databaseUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'DATABASE_URL is not configured'
    })
  }

  dataSource = new DataSource({
    type: 'postgres',
    url: config.databaseUrl,
    ssl: config.databaseSsl ? { rejectUnauthorized: false } : false,
    entities: [GiveawayEntity, EntryEntity, WinnerEntity],
    synchronize: true,
    logging: false
  })

  return dataSource.initialize()
}
