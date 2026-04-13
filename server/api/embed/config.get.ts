import { createEmbedDeliveryGatewayForEvent } from '../../lib/service-gateways/embed-delivery-event'

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
    const gateway = createEmbedDeliveryGatewayForEvent(event)
    return await gateway.runtimeConfig(tenantId)
  } catch {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tenant not found'
    })
  }
})
