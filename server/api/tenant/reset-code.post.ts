import { createTenantIdentityGateway } from '../../lib/service-gateways/tenant-identity'
import { getStorage } from '../../lib/storage'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string }>(event)
  const email = body?.email?.trim() || ''

  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'email is required'
    })
  }

  const storage = getStorage()
  const tenantUser = await storage.getTenantUserByEmail(email)
  const gateway = createTenantIdentityGateway(storage)

  return gateway.issueTenantUserResetCode({
    tenantId: tenantUser?.tenantId || '',
    email,
    loginUrl: `${(process.env.CUSTOMER_BOT_PUBLIC_BASE_URL || 'https://bot.aifactory.website').replace(/\/+$/, '')}/tenant/login`
  })
})
