import { createKnowledgeIndexingGateway } from '../../../../../../lib/service-gateways/knowledge-indexing'
import { requireAdminSession } from '../../../../../../lib/auth'
import { getRagRepository } from '../../../../../../lib/storage'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const tenantId = getRouterParam(event, 'tenantId')?.trim() || ''
  const jobId = getRouterParam(event, 'jobId')?.trim() || ''
  if (!tenantId || !jobId) {
    throw createError({ statusCode: 400, statusMessage: 'tenantId and jobId are required' })
  }

  const gateway = createKnowledgeIndexingGateway(getRagRepository())
  return gateway.retryJob({
    tenantId,
    jobId
  })
})
