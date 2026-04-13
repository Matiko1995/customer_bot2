import type { CreateTenantRequest, CreateTenantResponse } from '../../../packages/contracts/src/tenant/tenant.contract'
import { createTenantIdentityGatewayForEvent } from '../../lib/service-gateways/tenant-identity-event'
import type { TenantRecord } from '../../../types'
import { requireAdminSession } from '../../lib/auth'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const body = await readBody<CreateTenantRequest & Partial<TenantRecord>>(event)
  const gateway = createTenantIdentityGatewayForEvent(event)
  return gateway.createTenant(body) satisfies Promise<CreateTenantResponse>
})
