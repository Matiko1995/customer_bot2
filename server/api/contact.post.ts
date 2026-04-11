import { createAgentRuntimeGateway } from '../lib/service-gateways/agent-runtime'
import { getRagRepository, getStorage } from '../lib/storage'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    tenantId?: string
    sessionId?: string
    name?: string
    company?: string
    demandType?: string
    contact?: string
    message?: string
  }>(event)

  if (!body?.tenantId || !body?.name || !body.company || !body.contact || !body.demandType) {
    throw createError({
      statusCode: 400,
      statusMessage: '缺少必填字段'
    })
  }

  const storage = getStorage()
  const gateway = createAgentRuntimeGateway({
    storage,
    ragRepository: getRagRepository()
  })

  try {
    return await gateway.contact({
      tenantId: body.tenantId,
      sessionId: body.sessionId || '',
      name: body.name,
      company: body.company,
      contact: body.contact,
      demandType: body.demandType,
      message: body.message || ''
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Tenant not found') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Tenant not found'
      })
    }

    throw error
  }
})
