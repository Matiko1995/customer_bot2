import type { H3Event } from 'h3'
import { getCloudflareRuntimeBindings } from '../cloudflare/runtime.ts'
import { createAgentRuntimeGateway } from './agent-runtime.ts'
import { getRagRepository, getStorage } from '../storage/index.ts'

export function createAgentRuntimeGatewayForEvent(event: H3Event, options?: {
  endpoint?: string
  apiKey?: string
  model?: string
  platformEndpoint?: string
  platformApiKey?: string
  platformModel?: string
}) {
  return createAgentRuntimeGateway({
    storage: getStorage(),
    ragRepository: getRagRepository(),
    bindings: getCloudflareRuntimeBindings(event.context as { cloudflare?: { env?: unknown } }),
    endpoint: options?.endpoint,
    apiKey: options?.apiKey,
    model: options?.model,
    platformEndpoint: options?.platformEndpoint,
    platformApiKey: options?.platformApiKey,
    platformModel: options?.platformModel
  })
}
