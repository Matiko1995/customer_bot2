import { setTenantSession } from '../../lib/auth'
import { getStorage } from '../../lib/storage'
import { verifyTenantPassword } from '../../lib/tenant-users'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string; password?: string }>(event)
  const email = body?.email?.trim() || ''
  const password = body?.password || ''

  const user = await verifyTenantPassword(email, password, getStorage())
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials'
    })
  }

  setTenantSession(event, {
    tenantUserId: user.id,
    tenantId: user.tenantId,
    email: user.email
  })

  return {
    ok: true,
    user: {
      email: user.email,
      tenantId: user.tenantId,
      mustChangePassword: user.mustChangePassword
    }
  }
})
