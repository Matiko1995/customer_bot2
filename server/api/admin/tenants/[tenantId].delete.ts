import { requireAdminSession } from '../../../lib/auth'
import { getStorage } from '../../../lib/storage'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const tenantId = getRouterParam(event, 'tenantId') || ''
  const storage = getStorage()
  const tenant = await storage.getTenantById(tenantId)

  if (!tenant || tenant.deletedAt) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tenant not found'
    })
  }

  const updatedAt = Date.now()
  await storage.saveTenant({
    ...tenant,
    status: 'disabled',
    deletedAt: updatedAt,
    updatedAt
  })

  return { ok: true }
})
