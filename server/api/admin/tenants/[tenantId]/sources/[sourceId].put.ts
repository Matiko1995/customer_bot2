import type { DataSourceRecord } from '../../../../../types'
import { createKnowledgeIndexingGatewayForEvent } from '../../../../../lib/service-gateways/knowledge-indexing-event'
import { requireAdminSession } from '../../../../../lib/auth'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const tenantId = getRouterParam(event, 'tenantId')?.trim() || ''
  const sourceId = getRouterParam(event, 'sourceId')?.trim() || ''
  if (!tenantId || !sourceId) {
    throw createError({ statusCode: 400, statusMessage: 'tenantId and sourceId are required' })
  }

  const body = await readBody<Partial<DataSourceRecord>>(event)
  const gateway = createKnowledgeIndexingGatewayForEvent(event)
  return gateway.updateSource({
    tenantId,
    sourceId,
    type: body.type,
    status: body.status,
    syncMode: body.syncMode,
    scheduleCron: body.scheduleCron?.trim(),
    config: body.config
  })
})
