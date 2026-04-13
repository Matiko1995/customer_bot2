import type { DataSourceRecord } from '../../../../types'
import { createKnowledgeIndexingGatewayForEvent } from '../../../../lib/service-gateways/knowledge-indexing-event'
import { requireAdminSession } from '../../../../lib/auth'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const tenantId = getRouterParam(event, 'tenantId')?.trim() || ''
  if (!tenantId) {
    throw createError({ statusCode: 400, statusMessage: 'tenantId is required' })
  }

  const body = await readBody<Partial<DataSourceRecord>>(event)
  const gateway = createKnowledgeIndexingGatewayForEvent(event)
  return gateway.createSource({
    tenantId,
    type: body.type || 'file',
    syncMode: body.syncMode || 'manual',
    scheduleCron: body.scheduleCron?.trim() || '',
    config: body.config ?? {}
  })
})
