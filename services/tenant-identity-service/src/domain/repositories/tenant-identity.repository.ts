import type { TenantRecord, TenantUserRecord } from '../../../../../types'

export interface TenantIdentityRepository {
  saveTenant(tenant: TenantRecord): Promise<void>
  getTenantById(tenantId: string): Promise<TenantRecord | undefined>
  getTenantByEmbedKey(embedKey: string): Promise<TenantRecord | undefined>
  listTenants(): Promise<TenantRecord[]>
  saveTenantUser(user: TenantUserRecord): Promise<void>
  getTenantUserByEmail(email: string): Promise<TenantUserRecord | undefined>
  getTenantUserById(userId: string): Promise<TenantUserRecord | undefined>
  listTenantUsersByTenant(tenantId: string): Promise<TenantUserRecord[]>
}
