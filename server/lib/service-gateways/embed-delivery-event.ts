import type { H3Event } from 'h3'
import { getCloudflareRuntimeBindings } from '../cloudflare/runtime.ts'
import { createEmbedDeliveryGateway } from './embed-delivery.ts'
import { getStorage } from '../storage/index.ts'

export function createEmbedDeliveryGatewayForEvent(event: H3Event) {
  return createEmbedDeliveryGateway({
    storage: getStorage(),
    bindings: getCloudflareRuntimeBindings(event.context as { cloudflare?: { env?: unknown } })
  })
}
