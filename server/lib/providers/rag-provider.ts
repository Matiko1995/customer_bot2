import { createDbPool } from '../db/client.ts'
import { createPostgresRagRepository } from '../repositories/postgres-rag-repository.ts'
import { createInMemoryRagRepository, type RagRepository } from '../repositories/rag-repository.ts'

export interface RagProvider {
  kind: 'memory' | 'postgres' | 'vectorize'
  repository: RagRepository
}

export function createRagProvider(): RagProvider {
  if (process.env.CUSTOMER_BOT_DATABASE_URL?.trim()) {
    const deferredPool = createDbPool()
    return {
      kind: 'postgres',
      repository: createPostgresRagRepository({
        async query<T = Record<string, unknown>>(sql: string, params?: unknown[]) {
          const pool = await deferredPool
          return pool.query<T>(sql, params)
        },
        async end() {
          const pool = await deferredPool
          await pool.end()
        }
      })
    }
  }

  return {
    kind: 'memory',
    repository: createInMemoryRagRepository()
  }
}
