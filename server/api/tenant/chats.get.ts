import { createError, defineEventHandler, getQuery } from 'h3'
import { listTenantChatSummaries } from '../../lib/tenant-chat-workbench'
import { requireTenantSession } from '../../lib/auth'
import { getStorage } from '../../lib/storage'

export default defineEventHandler(async (event) => {
  const tenantSession = requireTenantSession(event)
  const storage = getStorage()
  const user = await storage.getTenantUserById(tenantSession.tenantUserId)

  if (!user || user.status !== 'active' || user.tenantId !== tenantSession.tenantId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const query = getQuery(event)
  const conversationMode =
    query.conversationMode === 'ai_active' || query.conversationMode === 'handover_requested' || query.conversationMode === 'human_active'
      ? query.conversationMode
      : undefined
  const assignedTenantUserId = typeof query.assignedTenantUserId === 'string' ? query.assignedTenantUserId.trim() : undefined
  const sort = query.sort === 'lastMessageAt:asc' ? 'lastMessageAt:asc' : 'lastMessageAt:desc'

  return {
    items: await listTenantChatSummaries(storage, tenantSession.tenantId, {
      conversationMode,
      assignedTenantUserId,
      sort
    })
  }
})
