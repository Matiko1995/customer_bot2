import { createKnowledgeIndexingGatewayForEvent } from '../../../../../../lib/service-gateways/knowledge-indexing-event'
import { requireAdminSession } from '../../../../../../lib/auth'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const tenantId = getRouterParam(event, 'tenantId')?.trim() || ''
  const jobId = getRouterParam(event, 'jobId')?.trim() || ''
  if (!tenantId || !jobId) {
    throw createError({ statusCode: 400, statusMessage: 'tenantId and jobId are required' })
  }

  const gateway = createKnowledgeIndexingGatewayForEvent(event)
  return gateway.retryJob({
    tenantId,
    jobId
  })
})
