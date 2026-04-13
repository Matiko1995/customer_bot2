import { createDemoTenant, getStorageFilePath } from '../demo.ts'
import { createFileStore } from '../storage/file-store.ts'
import type { StorageRepository } from '../storage/types.ts'

export interface StorageProvider {
  kind: 'local-file' | 'd1'
  repository: StorageRepository
}

export function createStorageProvider(): StorageProvider {
  return {
    kind: 'local-file',
    repository: createFileStore({
      filePath: getStorageFilePath(),
      seedTenants: [createDemoTenant()]
    })
  }
}
