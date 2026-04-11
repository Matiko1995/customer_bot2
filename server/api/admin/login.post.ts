import type { AdminLoginRequest } from '../../../packages/contracts/src/tenant/auth.contract'
import { createTenantIdentityGateway } from '../../lib/service-gateways/tenant-identity'
import { setAdminSession, validateAdminCredentials } from '../../lib/auth'
import { getStorage } from '../../lib/storage'

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<AdminLoginRequest>>(event)
  const email = body?.email?.trim() || ''
  const password = body?.password || ''

  try {
    const gateway = createTenantIdentityGateway(getStorage())
    const response = gateway.adminLogin({
      email,
      password
    })

    setAdminSession(event)
    return response
  } catch {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials'
    })
  }
})
