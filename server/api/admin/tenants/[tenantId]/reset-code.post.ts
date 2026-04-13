import { createTenantIdentityGatewayForEvent } from '../../../../lib/service-gateways/tenant-identity-event'
import { requireAdminSession } from '../../../../lib/auth'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const tenantId = getRouterParam(event, 'tenantId')?.trim() || ''
  try {
    const gateway = createTenantIdentityGatewayForEvent(event)
    return await gateway.issueTenantResetCode({
      tenantId,
      loginUrl: `${(process.env.CUSTOMER_BOT_PUBLIC_BASE_URL || 'https://bot.aifactory.website').replace(/\/+$/, '')}/tenant/login`
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Tenant not found'
    throw createError({
      statusCode: message.includes('required') ? 400 : 404,
      statusMessage: message
    })
  }
})
