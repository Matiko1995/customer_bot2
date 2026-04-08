import { createDemoTenant, getStorageFilePath } from '../demo'
import { createFileStore } from './file-store'
import type { StorageRepository } from './types'

let singletonStore: StorageRepository | undefined

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
