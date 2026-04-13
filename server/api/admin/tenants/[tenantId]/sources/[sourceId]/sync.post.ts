import { createKnowledgeIndexingGatewayForEvent } from '../../../../../../lib/service-gateways/knowledge-indexing-event'
import { requireAdminSession } from '../../../../../../lib/auth'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const tenantId = getRouterParam(event, 'tenantId')?.trim() || ''
  const sourceId = getRouterParam(event, 'sourceId')?.trim() || ''
  if (!tenantId || !sourceId) {
    throw createError({ statusCode: 400, statusMessage: 'tenantId and sourceId are required' })
  }

  try {
    const gateway = createKnowledgeIndexingGatewayForEvent(event)
    return await gateway.syncSource({
      tenantId,
      sourceId
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Source not found'
    throw createError({ statusCode: 404, statusMessage: 'Source not found' })
  }
})
