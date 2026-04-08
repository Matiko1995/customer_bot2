import { requireTenantSession } from '../../lib/auth'
import { getStorage } from '../../lib/storage'

export default defineEventHandler(async (event) => {
  const session = requireTenantSession(event)
  const storage = getStorage()
  const user = await storage.getTenantUserById(session.tenantUserId)
  const tenant = await storage.getTenantById(session.tenantId)

  if (!user || !tenant || user.status !== 'active') {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
      mustChangePassword: user.mustChangePassword
    },
    tenant
  }
})
