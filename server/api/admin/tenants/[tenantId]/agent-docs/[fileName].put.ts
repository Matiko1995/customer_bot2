import { createKnowledgeIndexingGateway } from '../../../../../lib/service-gateways/knowledge-indexing'
import { requireAdminSession } from '../../../../../lib/auth'
import { getRagRepository } from '../../../../../lib/storage'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const tenantId = getRouterParam(event, 'tenantId')?.trim() || ''
  const fileName = getRouterParam(event, 'fileName')?.trim() || ''
  if (!tenantId || !fileName) {
    throw createError({ statusCode: 400, statusMessage: 'tenantId and fileName are required' })
  }

  const body = await readBody<{ content?: string }>(event)
  if (typeof body.content !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'content is required' })
  }

  const gateway = createKnowledgeIndexingGateway(getRagRepository())
  return gateway.saveAgentDoc({
    tenantId,
    fileName,
    content: body.content
  })
})
