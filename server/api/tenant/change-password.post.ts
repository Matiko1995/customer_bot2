import { requireTenantSession } from '../../lib/auth'
import { getStorage } from '../../lib/storage'
import { verifyTenantPassword } from '../../lib/tenant-users'

export default defineEventHandler(async (event) => {
  const session = requireTenantSession(event)
  const body = await readBody<{ currentPassword?: string; nextPassword?: string }>(event)
  const currentPassword = body?.currentPassword || ''
  const nextPassword = body?.nextPassword || ''

  if (!currentPassword || !nextPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: 'currentPassword and nextPassword are required'
    })
  }

  const storage = getStorage()
  const user = await verifyTenantPassword(session.email, currentPassword, storage)
  if (!user || user.id !== session.tenantUserId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials'
    })
  }

  const updatedUser = {
    ...user,
    passwordHash: user.passwordHash,
    temporaryPassword: '',
    mustChangePassword: false,
    updatedAt: Date.now()
  }

  const { createHash } = await import('node:crypto')
  updatedUser.passwordHash = createHash('sha256').update(nextPassword).digest('hex')

  await storage.saveTenantUser(updatedUser)

  return {
    ok: true
  }
})
