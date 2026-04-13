import { createStorageProvider } from '../providers/storage-provider.ts'
import { createRagProvider } from '../providers/rag-provider.ts'
import type { StorageRepository } from './types'
import type { RagRepository } from '../repositories/rag-repository.ts'

let singletonStore: StorageRepository | undefined
let singletonRagRepository: RagRepository | undefined

export const createStorage = (): StorageRepository =>
  createStorageProvider().repository

export const getStorage = (): StorageRepository => {
  if (!singletonStore) {
    singletonStore = createStorage()
  }

  return singletonStore
}

export const createRagRepository = (): RagRepository =>
  createRagProvider().repository

export const getRagRepository = (): RagRepository => {
  if (!singletonRagRepository) {
    singletonRagRepository = createRagRepository()
  }

  return singletonRagRepository
}
