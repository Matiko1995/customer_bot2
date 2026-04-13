import { createKnowledgeIndexingGatewayForEvent } from '../../../../../lib/service-gateways/knowledge-indexing-event'
import { requireAdminSession } from '../../../../../lib/auth'

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

  const gateway = createKnowledgeIndexingGatewayForEvent(event)
  return gateway.saveAgentDoc({
    tenantId,
    fileName,
    content: body.content
  })
})
