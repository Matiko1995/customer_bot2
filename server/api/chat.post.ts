import type { MessageAttachment } from '../../types'
import { createAgentRuntimeGateway } from '../lib/service-gateways/agent-runtime'
import { SessionNotFoundError } from '../lib/chat'
import { getRagRepository, getStorage } from '../lib/storage'
import { TenantNotFoundError } from '../lib/tenants'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const body = await readBody<{
    tenantId?: string
    message?: string
    sessionId?: string
    attachments?: MessageAttachment[]
  }>(event)

  const tenantId = body?.tenantId?.trim()
  const message = body?.message?.trim()

  if (!tenantId || !message) {
    throw createError({
      statusCode: 400,
      statusMessage: 'tenantId and message are required'
    })
  }

  try {
    const gateway = createAgentRuntimeGateway({
      storage: getStorage(),
      ragRepository: getRagRepository(),
      endpoint: runtimeConfig.customerBotLlmEndpoint,
      apiKey: runtimeConfig.customerBotLlmApiKey,
      model: runtimeConfig.customerBotLlmModel,
      platformEndpoint: runtimeConfig.customerBotPlatformLlmEndpoint,
      platformApiKey: runtimeConfig.customerBotPlatformLlmApiKey,
      platformModel: runtimeConfig.customerBotPlatformLlmModel
    })

    return await gateway.chat({
      tenantId,
      message,
      sessionId: body?.sessionId?.trim(),
      attachments: Array.isArray(body?.attachments) ? body.attachments : []
    })
  } catch (error) {
    if (error instanceof TenantNotFoundError) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Tenant not found'
      })
    }

    if (error instanceof SessionNotFoundError) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Session not found'
      })
    }

    throw error
  }
})
