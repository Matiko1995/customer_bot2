import type { ListTenantsResponse } from '../../../packages/contracts/src/tenant/tenant.contract'
import { createTenantIdentityGatewayForEvent } from '../../lib/service-gateways/tenant-identity-event'
import { requireAdminSession } from '../../lib/auth'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const query = getQuery(event)
  const includeDeleted = String(query.includeDeleted || '') === '1'
  const gateway = createTenantIdentityGatewayForEvent(event)
  return gateway.listTenants({ includeDeleted }) satisfies Promise<ListTenantsResponse>
})
