import type { TenantMeResponse } from '../../../packages/contracts/src/tenant/tenant-user.contract'
import { createTenantIdentityGatewayForEvent } from '../../lib/service-gateways/tenant-identity-event'
import { requireTenantSession } from '../../lib/auth'

export default defineEventHandler(async (event) => {
  const session = requireTenantSession(event)
  try {
    const gateway = createTenantIdentityGatewayForEvent(event)
    return gateway.tenantMe({
      tenantUserId: session.tenantUserId,
      tenantId: session.tenantId
    }) satisfies Promise<TenantMeResponse>
  } catch {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }
})
