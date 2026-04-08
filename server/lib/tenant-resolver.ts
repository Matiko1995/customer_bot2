import type { TenantRecord } from '../../types'
import { getStorage } from './storage'
import type { StorageRepository } from './storage/types'

export async function resolveTenant(identifier: string, storage: StorageRepository = getStorage()): Promise<TenantRecord | undefined> {
  const normalized = identifier.trim()
  if (!normalized) {
    return undefined
  }

  const byId = await storage.getTenantById(normalized)
  if (byId && !byId.deletedAt) {
    return byId
  }

  const byEmbedKey = await storage.getTenantByEmbedKey(normalized)
  if (byEmbedKey && !byEmbedKey.deletedAt) {
    return byEmbedKey
  }

  return undefined
}
