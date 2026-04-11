import type { ChangeTenantPasswordRequest } from '../../../packages/contracts/src/tenant/auth.contract'
import { createTenantIdentityGateway } from '../../lib/service-gateways/tenant-identity'
import { requireTenantSession } from '../../lib/auth'
import { getStorage } from '../../lib/storage'

export default defineEventHandler(async (event) => {
  const session = requireTenantSession(event)
  const body = await readBody<Partial<ChangeTenantPasswordRequest>>(event)
  const currentPassword = body?.currentPassword || ''
  const nextPassword = body?.nextPassword || ''

  try {
    const gateway = createTenantIdentityGateway(getStorage())
    return await gateway.changeTenantPassword({
      tenantUserId: session.tenantUserId,
      tenantId: session.tenantId,
      email: session.email,
      currentPassword,
      nextPassword
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid credentials'
    throw createError({
      statusCode: message.includes('required') ? 400 : 401,
      statusMessage: message
    })
  }
})
