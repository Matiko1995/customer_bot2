import { createEmbedDeliveryGatewayForEvent } from '../lib/service-gateways/embed-delivery-event'

export default defineEventHandler(async (event) => {
  try {
    const gateway = createEmbedDeliveryGatewayForEvent(event)
    const result = await gateway.widgetScript()
    setHeader(event, 'Content-Type', result.contentType)
    setHeader(event, 'Cache-Control', result.cacheControl)
    return result.code
  } catch (error) {
    throw error
  }
})
