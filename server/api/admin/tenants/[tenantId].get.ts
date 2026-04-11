import type { GetTenantResponse } from '../../../../packages/contracts/src/tenant/tenant.contract'
import { createTenantIdentityGateway } from '../../../lib/service-gateways/tenant-identity'
import { requireAdminSession } from '../../../lib/auth'
import { getStorage } from '../../../lib/storage'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const tenantId = getRouterParam(event, 'tenantId') || ''
  try {
    const gateway = createTenantIdentityGateway(getStorage())
    return gateway.getTenant(tenantId) satisfies Promise<GetTenantResponse>
  } catch {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tenant not found'
    })
  }
})
