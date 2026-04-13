import type { TenantUserLoginRequest, TenantUserLoginResponse } from '../../../packages/contracts/src/tenant/auth.contract'
import { createTenantIdentityGatewayForEvent } from '../../lib/service-gateways/tenant-identity-event'
import { setTenantSession } from '../../lib/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<TenantUserLoginRequest>>(event)
  const email = body?.email?.trim() || ''
  const password = body?.password || ''

  const gateway = createTenantIdentityGatewayForEvent(event)

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
