import { requireAdminSession } from '../../../lib/auth'
import { getStorage } from '../../../lib/storage'
import { resolveTenant } from '../../../lib/tenant-resolver'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const tenantId = getRouterParam(event, 'tenantId') || ''
  const storage = getStorage()
  const tenant = await resolveTenant(tenantId, storage)

  if (!tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tenant not found'
    })
  }

  return {
    item: tenant,
    tenantUsers: await storage.listTenantUsersByTenant(tenant.id)
  }
})
