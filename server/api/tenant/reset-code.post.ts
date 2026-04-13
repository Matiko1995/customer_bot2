import { createTenantIdentityGatewayForEvent, createTenantIdentityStorageForEvent } from '../../lib/service-gateways/tenant-identity-event'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string }>(event)
  const email = body?.email?.trim() || ''

  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'email is required'
    })
  }

  const storage = createTenantIdentityStorageForEvent(event)
  const tenantUser = await storage.getTenantUserByEmail(email)
  const gateway = createTenantIdentityGatewayForEvent(event)

  return gateway.issueTenantUserResetCode({
    tenantId: tenantUser?.tenantId || '',
    email,
    loginUrl: `${(process.env.CUSTOMER_BOT_PUBLIC_BASE_URL || 'https://bot.aifactory.website').replace(/\/+$/, '')}/tenant/login`
  })
})
