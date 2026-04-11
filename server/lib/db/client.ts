export interface DbQueryResult<T = Record<string, unknown>> {
  rows: T[]
}

export interface DbPool {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<DbQueryResult<T>>
  end(): Promise<void>
}

let sharedPool: DbPool | undefined

function getConnectionString(): string {
  const value = process.env.CUSTOMER_BOT_DATABASE_URL?.trim()
  if (!value) {
    throw new Error('CUSTOMER_BOT_DATABASE_URL is required')
  }

  return value
}

export async function createDbPool(): Promise<DbPool> {
  const optionalModule = await import('../optional-module.ts')
  const pgModule = await optionalModule.importOptionalModule<{ Pool: new (options: { connectionString: string }) => DbPool }>(
    'pg',
    'npm install pg'
  )
  const Pool = pgModule.Pool as new (options: { connectionString: string }) => DbPool

  return new Pool({
    connectionString: getConnectionString()
  })
}

export async function getDbPool(): Promise<DbPool> {
  if (!sharedPool) {
    sharedPool = await createDbPool()
  }

  return sharedPool
}

export async function closeDbPool() {
  if (!sharedPool) {
    return
  }

  await sharedPool.end()
  sharedPool = undefined
}
