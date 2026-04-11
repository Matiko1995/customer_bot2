import { createEmbedDeliveryGateway } from '../../lib/service-gateways/embed-delivery'
import { getStorage } from '../../lib/storage'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const tenantId = typeof query.tenantId === 'string' ? query.tenantId.trim() : ''

  if (!tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'tenantId is required'
    })
  }

  try {
    const gateway = createEmbedDeliveryGateway(getStorage())
    return await gateway.runtimeConfig(tenantId)
  } catch {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tenant not found'
    })
  }
})
