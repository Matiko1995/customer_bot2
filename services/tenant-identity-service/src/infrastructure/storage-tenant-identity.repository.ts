import type { StorageRepository } from '../../../../../server/lib/storage/types'
import type { TenantIdentityRepository } from '../domain/repositories/tenant-identity.repository'

export class StorageTenantIdentityRepositoryAdapter implements TenantIdentityRepository {
  private readonly storage: StorageRepository

  constructor(storage: StorageRepository) {
    this.storage = storage
  }

  saveTenant(tenant: Parameters<StorageRepository['saveTenant']>[0]) {
    return this.storage.saveTenant(tenant)
  }

  getTenantById(tenantId: string) {
    return this.storage.getTenantById(tenantId)
  }

  getTenantByEmbedKey(embedKey: string) {
    return this.storage.getTenantByEmbedKey(embedKey)
  }

  listTenants() {
    return this.storage.listTenants()
  }

  saveTenantUser(user: Parameters<StorageRepository['saveTenantUser']>[0]) {
    return this.storage.saveTenantUser(user)
  }

  getTenantUserByEmail(email: string) {
    return this.storage.getTenantUserByEmail(email)
  }

  getTenantUserById(userId: string) {
    return this.storage.getTenantUserById(userId)
  }

  listTenantUsersByTenant(tenantId: string) {
    return this.storage.listTenantUsersByTenant(tenantId)
  }
}
