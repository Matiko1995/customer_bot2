import type { CreateTenantRequest, CreateTenantResponse } from '../../../packages/contracts/src/tenant/tenant.contract'
import { createTenantIdentityGateway } from '../../lib/service-gateways/tenant-identity'
import type { TenantRecord } from '../../../types'
import { requireAdminSession } from '../../lib/auth'
import { getStorage } from '../../lib/storage'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const body = await readBody<CreateTenantRequest & Partial<TenantRecord>>(event)
  const storage = getStorage()
  const gateway = createTenantIdentityGateway(storage)
  return gateway.createTenant(body) satisfies Promise<CreateTenantResponse>
})
