import { requireAdminSession } from '../../../../lib/auth'
import { getStorage } from '../../../../lib/storage'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const tenantId = getRouterParam(event, 'tenantId') || ''
  const storage = getStorage()
  const tenant = await storage.getTenantById(tenantId)

  if (!tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tenant not found'
    })
  }

  await storage.saveTenant({
    ...tenant,
    status: 'active',
    deletedAt: undefined,
    updatedAt: Date.now()
  })

  return { ok: true }
})
