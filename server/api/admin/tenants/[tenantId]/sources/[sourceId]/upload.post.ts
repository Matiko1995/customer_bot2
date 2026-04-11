import type { DataSourceRecord } from '../../../../../../types'
import { createKnowledgeIndexingGateway } from '../../../../../../lib/service-gateways/knowledge-indexing'
import { requireAdminSession } from '../../../../../../lib/auth'
import { getRagRepository } from '../../../../../../lib/storage'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const tenantId = getRouterParam(event, 'tenantId')?.trim() || ''
  const sourceId = getRouterParam(event, 'sourceId')?.trim() || ''
  if (!tenantId || !sourceId) {
    throw createError({ statusCode: 400, statusMessage: 'tenantId and sourceId are required' })
  }

  const body = await readBody<{ fileName?: string; mimeType?: string; base64Data?: string }>(event)
  const fileName = body.fileName?.trim() || ''
  const base64Data = body.base64Data?.trim() || ''
  if (!fileName || !base64Data) {
    throw createError({ statusCode: 400, statusMessage: 'fileName and base64Data are required' })
  }

  const gateway = createKnowledgeIndexingGateway(getRagRepository())
  return gateway.uploadSourceAsset({
    tenantId,
    sourceId,
    fileName,
    mimeType: body.mimeType?.trim() || 'application/octet-stream',
    base64Data
  })
})
