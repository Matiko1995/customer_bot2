import { requireAdminSession } from '../../lib/auth'
import { getStorage } from '../../lib/storage'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const tenantId = typeof getQuery(event).tenantId === 'string' ? String(getQuery(event).tenantId) : ''
  if (!tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'tenantId is required'
    })
  }

  return {
    items: await getStorage().listLeadsByTenant(tenantId)
  }
})
