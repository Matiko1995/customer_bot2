import type { RuntimeWidgetConfig } from '../../types'
import { getStorage } from './storage'
import type { StorageRepository } from './storage/types'
import { resolveTenant } from './tenant-resolver'

export class TenantNotFoundError extends Error {
  code = 'TENANT_NOT_FOUND' as const

  constructor(tenantId: string) {
    super(`Tenant not found: ${tenantId}`)
    this.name = 'TenantNotFoundError'
    Object.setPrototypeOf(this, TenantNotFoundError.prototype)
  }
}

export async function getRuntimeConfigForTenant(
  tenantId: string,
  storage: StorageRepository = getStorage()
): Promise<RuntimeWidgetConfig> {
  const tenant = await resolveTenant(tenantId, storage)

  if (!tenant) {
    throw new TenantNotFoundError(tenantId)
  }

  return {
    tenantId: tenant.id,
    status: tenant.status,
    brandName: tenant.brandName,
    themeColor: tenant.themeColor,
    contactPhone: tenant.contactPhone,
    contactEmail: tenant.contactEmail,
    contactAddress: tenant.contactAddress,
    systemPrompt: tenant.systemPrompt
  }
}
