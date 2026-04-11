import { createDemoTenant, getStorageFilePath } from '../demo.ts'
import { createDbPool } from '../db/client.ts'
import { createPostgresRagRepository } from '../repositories/postgres-rag-repository.ts'
import { createInMemoryRagRepository } from '../repositories/rag-repository.ts'
import { createFileStore } from './file-store.ts'
import type { StorageRepository } from './types'
import type { RagRepository } from '../repositories/rag-repository.ts'

let singletonStore: StorageRepository | undefined
let singletonRagRepository: RagRepository | undefined

export const createStorage = (): StorageRepository =>
  createFileStore({
    filePath: getStorageFilePath(),
    seedTenants: [createDemoTenant()]
  })

export const getStorage = (): StorageRepository => {
  if (!singletonStore) {
    singletonStore = createStorage()
  }

  return singletonStore
}

export const createRagRepository = (): RagRepository => {
  if (process.env.CUSTOMER_BOT_DATABASE_URL?.trim()) {
    const deferredPool = createDbPool()
    return createPostgresRagRepository({
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

  return createInMemoryRagRepository()
}

export const getRagRepository = (): RagRepository => {
  if (!singletonRagRepository) {
    singletonRagRepository = createRagRepository()
  }

  return singletonRagRepository
}
