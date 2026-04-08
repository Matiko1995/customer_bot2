import { requireAdminSession } from '../../../../lib/auth'
import { getStorage } from '../../../../lib/storage'
import { resolveTenant } from '../../../../lib/tenant-resolver'
import { simulateTenantTraining } from '../../../../lib/training-simulator'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const tenantId = getRouterParam(event, 'tenantId')?.trim()
  if (!tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'tenantId is required'
    })
  }

  const storage = getStorage()
  const tenant = await resolveTenant(tenantId, storage)

  if (!tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tenant not found'
    })
  }

  try {
    return await simulateTenantTraining({
      tenant,
      storage
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '训练模拟失败'
    throw createError({
      statusCode: 400,
      statusMessage: message
    })
  }
})
