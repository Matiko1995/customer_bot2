import type { UpdateTenantRequest, UpdateTenantResponse } from '../../../../packages/contracts/src/tenant/tenant.contract'
import { createTenantIdentityGatewayForEvent } from '../../../lib/service-gateways/tenant-identity-event'
import type { TenantRecord } from '../../../../types'
import { requireAdminSession } from '../../../lib/auth'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const tenantIdentifier = getRouterParam(event, 'tenantId') || ''
  const body = await readBody<UpdateTenantRequest & Partial<TenantRecord>>(event)
  try {
    const gateway = createTenantIdentityGatewayForEvent(event)
    return gateway.updateTenant(tenantIdentifier, body) satisfies Promise<UpdateTenantResponse>
  } catch {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tenant not found'
    })
  }
})
