import { requireAdminSession } from '../../../../lib/auth'
import { sendTenantResetEmail } from '../../../../lib/mailer'
import { getStorage } from '../../../../lib/storage'
import { resolveTenant } from '../../../../lib/tenant-resolver'
import { issueTenantPasswordReset } from '../../../../lib/tenant-users'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const tenantId = getRouterParam(event, 'tenantId')?.trim() || ''
  const storage = getStorage()
  const tenant = await resolveTenant(tenantId, storage)

  if (!tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tenant not found'
    })
  }

  const email = tenant.contactEmail?.trim()
  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tenant contact email is required'
    })
  }

  const reset = await issueTenantPasswordReset({
    email,
    storage
  })
  const sent = await sendTenantResetEmail({
    to: reset.email,
    code: reset.code,
    expiresAt: reset.expiresAt,
    tenantName: tenant.name,
    loginUrl: `${(process.env.CUSTOMER_BOT_PUBLIC_BASE_URL || 'https://bot.aifactory.website').replace(/\/+$/, '')}/tenant/login`
  })

  return {
    ok: true,
    item: {
      email: reset.email,
      expiresAt: reset.expiresAt,
      provider: sent.provider,
      previewCode: sent.previewCode
    }
  }
})
