import { createKnowledgeIndexingGateway } from '../../../../lib/service-gateways/knowledge-indexing'
import { requireAdminSession } from '../../../../lib/auth'
import { getRagRepository } from '../../../../lib/storage'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const tenantId = getRouterParam(event, 'tenantId')?.trim() || ''
  if (!tenantId) {
    throw createError({ statusCode: 400, statusMessage: 'tenantId is required' })
  }

  const gateway = createKnowledgeIndexingGateway(getRagRepository())
  return gateway.getIndexStats(tenantId)
})
