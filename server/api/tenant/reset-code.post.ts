import { getStorage } from '../../lib/storage'
import { sendTenantResetEmail } from '../../lib/mailer'
import { issueTenantPasswordReset } from '../../lib/tenant-users'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string }>(event)
  const email = body?.email?.trim() || ''

  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'email is required'
    })
  }

  const reset = await issueTenantPasswordReset({
    email,
    storage: getStorage()
  })
  const sent = await sendTenantResetEmail({
    to: reset.email,
    code: reset.code,
    expiresAt: reset.expiresAt,
    tenantName: reset.tenantId,
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
