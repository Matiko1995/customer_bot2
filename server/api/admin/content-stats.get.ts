import { aggregateMatchedContentSourceStats } from '../../../lib/content-ops'
import { requireAdminSession } from '../../lib/auth'
import { getStorage } from '../../lib/storage'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const tenantId = typeof getQuery(event).tenantId === 'string' ? String(getQuery(event).tenantId) : ''
  if (!tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'tenantId is required'
    })
  }

  const storage = getStorage()
  const sessions = await storage.listSessionsByTenant(tenantId)
  const messageGroups = await Promise.all(sessions.map((session) => storage.listMessagesBySession(session.id)))
  const messages = messageGroups.flat()

  return {
    items: aggregateMatchedContentSourceStats(messages)
  }
})
