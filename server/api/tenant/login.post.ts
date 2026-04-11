import type { TenantUserLoginRequest, TenantUserLoginResponse } from '../../../packages/contracts/src/tenant/auth.contract'
import { createTenantIdentityGateway } from '../../lib/service-gateways/tenant-identity'
import { setTenantSession } from '../../lib/auth'
import { getStorage } from '../../lib/storage'

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<TenantUserLoginRequest>>(event)
  const email = body?.email?.trim() || ''
  const password = body?.password || ''

  const storage = getStorage()
  const gateway = createTenantIdentityGateway(storage)

  let response: TenantUserLoginResponse
  try {
    response = await gateway.tenantUserLogin({
      email,
      password
    })
  } catch {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials'
    })
  }

  setTenantSession(event, {
    tenantUserId: response.user.tenantUserId,
    tenantId: response.user.tenantId,
    email: response.user.email
  })

  return response
})
