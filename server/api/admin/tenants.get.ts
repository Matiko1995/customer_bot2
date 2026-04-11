import type { ListTenantsResponse } from '../../../packages/contracts/src/tenant/tenant.contract'
import { createTenantIdentityGateway } from '../../lib/service-gateways/tenant-identity'
import { requireAdminSession } from '../../lib/auth'
import { getStorage } from '../../lib/storage'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const storage = getStorage()
  const query = getQuery(event)
  const includeDeleted = String(query.includeDeleted || '') === '1'
  const gateway = createTenantIdentityGateway(storage)
  return gateway.listTenants({ includeDeleted }) satisfies Promise<ListTenantsResponse>
})
