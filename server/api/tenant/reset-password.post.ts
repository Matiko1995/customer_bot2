import { setTenantSession } from '../../lib/auth'
import { getStorage } from '../../lib/storage'
import { resetTenantPassword } from '../../lib/tenant-users'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string; code?: string; nextPassword?: string }>(event)
  const email = body?.email?.trim() || ''
  const code = body?.code?.trim() || ''
  const nextPassword = body?.nextPassword || ''

  if (!email || !code || !nextPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: 'email, code and nextPassword are required'
    })
  }

  const user = await resetTenantPassword({
    email,
    code,
    nextPassword,
    storage: getStorage()
  })

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
