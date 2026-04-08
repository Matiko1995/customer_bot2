import { getStorage } from '../lib/storage'
import { resolveTenant } from '../lib/tenant-resolver'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    tenantId?: string
    sessionId?: string
    name?: string
    company?: string
    demandType?: string
    contact?: string
    message?: string
  }>(event)

  if (!body?.tenantId || !body?.name || !body.company || !body.contact || !body.demandType) {
    throw createError({
      statusCode: 400,
      statusMessage: '缺少必填字段'
    })
  }

  const storage = getStorage()
  const tenant = await resolveTenant(body.tenantId, storage)

  if (!tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tenant not found'
    })
  }

  const leadId = `lead-${Date.now()}`
  await storage.saveLead({
    id: leadId,
    tenantId: tenant.id,
    sessionId: body.sessionId || '',
    name: body.name,
    company: body.company,
    contact: body.contact,
    demandType: body.demandType,
    message: body.message || '',
    createdAt: Date.now()
  })

  return {
    ok: true,
    id: leadId,
    message: '提交成功，我们会在 1 个工作日内联系你。'
  }
})
