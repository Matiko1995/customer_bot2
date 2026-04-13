import { createKnowledgeIndexingGatewayForEvent } from '../../../../lib/service-gateways/knowledge-indexing-event'
import { requireAdminSession } from '../../../../lib/auth'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const tenantId = getRouterParam(event, 'tenantId')?.trim() || ''
  if (!tenantId) {
    throw createError({ statusCode: 400, statusMessage: 'tenantId is required' })
  }

  const gateway = createKnowledgeIndexingGatewayForEvent(event)
  return gateway.listSources(tenantId)
})
