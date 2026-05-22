import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import {
  TenantChatForbiddenError,
  TenantChatSessionNotFoundError,
  TenantChatValidationError,
  replyToTenantChat
} from '../../../../lib/tenant-chat-workbench'
import { requireTenantSession } from '../../../../lib/auth'
import { getStorage } from '../../../../lib/storage'

export default defineEventHandler(async (event) => {
  const tenantSession = requireTenantSession(event)
  const sessionId = getRouterParam(event, 'sessionId') || ''
  const body = await readBody<{ content?: string }>(event)

  if (!sessionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'sessionId is required'
    })
  }

  try {
    return await replyToTenantChat(getStorage(), tenantSession.tenantId, tenantSession.tenantUserId, sessionId, body?.content || '')
  } catch (error) {
    if (error instanceof TenantChatSessionNotFoundError) {
      throw createError({
        statusCode: 404,
        statusMessage: error.message
      })
    }

    if (error instanceof TenantChatValidationError) {
      throw createError({
        statusCode: 400,
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
