import type { GetTenantResponse } from '../../../../packages/contracts/src/tenant/tenant.contract'
import { createTenantIdentityGatewayForEvent } from '../../../lib/service-gateways/tenant-identity-event'
import { requireAdminSession } from '../../../lib/auth'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const tenantId = getRouterParam(event, 'tenantId') || ''
  try {
    const gateway = createTenantIdentityGatewayForEvent(event)
    return gateway.getTenant(tenantId) satisfies Promise<GetTenantResponse>
  } catch {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tenant not found'
    })
  }
})
