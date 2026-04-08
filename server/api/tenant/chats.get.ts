import { buildTenantChatItems } from '../../../lib/tenant-readonly'
import { requireTenantSession } from '../../lib/auth'
import { getStorage } from '../../lib/storage'

export default defineEventHandler(async (event) => {
  const session = requireTenantSession(event)
  const storage = getStorage()
  const user = await storage.getTenantUserById(session.tenantUserId)

  if (!user || user.status !== 'active' || user.tenantId !== session.tenantId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const sessions = await storage.listSessionsByTenant(session.tenantId)
  const messagesBySession = new Map(
    await Promise.all(
      sessions.map(async (chatSession) => [chatSession.id, await storage.listMessagesBySession(chatSession.id)] as const)
    )
  )

  return {
    items: buildTenantChatItems(sessions, messagesBySession)
  }
})
