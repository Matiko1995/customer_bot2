import { createEmbedDeliveryGateway } from '../lib/service-gateways/embed-delivery'
import { getStorage } from '../lib/storage'

export default defineEventHandler(async (event) => {
  try {
    const gateway = createEmbedDeliveryGateway(getStorage())
    const result = await gateway.widgetScript()
    setHeader(event, 'Content-Type', result.contentType)
    setHeader(event, 'Cache-Control', result.cacheControl)
    return result.code
  } catch (error) {
    throw error
  }
})
