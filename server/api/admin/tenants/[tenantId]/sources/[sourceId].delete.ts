import type { DataSourceRecord } from '../../../../../types'
import { createKnowledgeIndexingGateway } from '../../../../../lib/service-gateways/knowledge-indexing'
import { requireAdminSession } from '../../../../../lib/auth'
import { getRagRepository } from '../../../../../lib/storage'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const tenantId = getRouterParam(event, 'tenantId')?.trim() || ''
  const sourceId = getRouterParam(event, 'sourceId')?.trim() || ''
  if (!tenantId || !sourceId) {
    throw createError({ statusCode: 400, statusMessage: 'tenantId and sourceId are required' })
  }

  const gateway = createKnowledgeIndexingGateway(getRagRepository())
  return gateway.disableSource({
    tenantId,
    sourceId
  })
})
