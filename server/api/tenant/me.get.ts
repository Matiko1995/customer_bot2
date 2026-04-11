import type { TenantMeResponse } from '../../../packages/contracts/src/tenant/tenant-user.contract'
import { createTenantIdentityGateway } from '../../lib/service-gateways/tenant-identity'
import { requireTenantSession } from '../../lib/auth'
import { getStorage } from '../../lib/storage'

export default defineEventHandler(async (event) => {
  const session = requireTenantSession(event)
  try {
    const gateway = createTenantIdentityGateway(getStorage())
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
