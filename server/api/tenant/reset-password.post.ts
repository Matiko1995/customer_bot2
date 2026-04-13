import type { TenantResetPasswordRequest } from '../../../packages/contracts/src/tenant/auth.contract'
import { createTenantIdentityGatewayForEvent } from '../../lib/service-gateways/tenant-identity-event'
import { setTenantSession } from '../../lib/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<TenantResetPasswordRequest>>(event)
  const email = body?.email?.trim() || ''
  const code = body?.code?.trim() || ''
  const nextPassword = body?.nextPassword || ''

  if (!email || !code || !nextPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: 'email, code and nextPassword are required'
    })
  }

  const gateway = createTenantIdentityGatewayForEvent(event)
  const response = await gateway.resetTenantPassword({
    email,
    code,
    nextPassword
  })

  setTenantSession(event, {
    tenantUserId: response.user.tenantUserId,
    tenantId: response.user.tenantId,
    email: response.user.email
  })

  return response
})
