import type { UpdateTenantRequest, UpdateTenantResponse } from '../../../../packages/contracts/src/tenant/tenant.contract'
import { createTenantIdentityGateway } from '../../../lib/service-gateways/tenant-identity'
import type { TenantRecord } from '../../../../types'
import { requireAdminSession } from '../../../lib/auth'
import { getStorage } from '../../../lib/storage'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const tenantIdentifier = getRouterParam(event, 'tenantId') || ''
  const body = await readBody<UpdateTenantRequest & Partial<TenantRecord>>(event)
  try {
    const gateway = createTenantIdentityGateway(getStorage())
    return gateway.updateTenant(tenantIdentifier, body) satisfies Promise<UpdateTenantResponse>
  } catch {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tenant not found'
    })
  }
})
