import { createError, defineEventHandler, getRouterParam } from 'h3'
import {
  TenantChatForbiddenError,
  TenantChatSessionNotFoundError,
  releaseTenantChat
} from '../../../../lib/tenant-chat-workbench'
import { requireTenantSession } from '../../../../lib/auth'
import { getStorage } from '../../../../lib/storage'

export default defineEventHandler(async (event) => {
  const tenantSession = requireTenantSession(event)
  const sessionId = getRouterParam(event, 'sessionId') || ''

  if (!sessionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'sessionId is required'
    })
  }

  try {
    return await releaseTenantChat(getStorage(), tenantSession.tenantId, tenantSession.tenantUserId, sessionId)
  } catch (error) {
    if (error instanceof TenantChatSessionNotFoundError) {
      throw createError({
        statusCode: 404,
        statusMessage: error.message
      })
    }

    if (error instanceof TenantChatForbiddenError) {
      throw createError({
        statusCode: 403,
        statusMessage: error.message
      })
    }

    throw error
  }
})
