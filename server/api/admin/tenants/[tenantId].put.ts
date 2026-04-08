import type { TenantRecord } from '../../../../types'
import { requireAdminSession } from '../../../lib/auth'
import { getStorage } from '../../../lib/storage'
import { resolveTenant } from '../../../lib/tenant-resolver'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const tenantIdentifier = getRouterParam(event, 'tenantId') || ''
  const storage = getStorage()
  const existing = await resolveTenant(tenantIdentifier, storage)

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tenant not found'
    })
  }

  const body = await readBody<Partial<TenantRecord>>(event)
  const updated: TenantRecord = {
    ...existing,
    ...body,
    llmEndpoint: body.llmEndpoint !== undefined ? body.llmEndpoint?.trim() || '' : existing.llmEndpoint,
    llmApiKey: body.llmApiKey !== undefined ? body.llmApiKey?.trim() || '' : existing.llmApiKey,
    llmModel: body.llmModel !== undefined ? body.llmModel?.trim() || '' : existing.llmModel,
    reuseAnsweredQuestions:
      body.reuseAnsweredQuestions !== undefined ? body.reuseAnsweredQuestions !== false : existing.reuseAnsweredQuestions,
    id: existing.id,
    embedKey: existing.embedKey,
    createdAt: existing.createdAt,
    updatedAt: Date.now()
  }

  await storage.saveTenant(updated)

  return {
    ok: true,
    item: updated
  }
})
