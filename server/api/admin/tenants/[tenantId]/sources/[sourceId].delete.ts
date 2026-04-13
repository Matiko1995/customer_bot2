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

  const gateway = createKnowledgeIndexingGatewayForEvent(event)
  return gateway.disableSource({
    tenantId,
    sourceId
  })
})
