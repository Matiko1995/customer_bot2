import type { H3Event } from 'h3'
import { getCloudflareRuntimeBindings } from '../cloudflare/runtime.ts'
import { createKnowledgeIndexingGateway } from './knowledge-indexing.ts'
import { getRagRepository } from '../storage/index.ts'

export function createKnowledgeIndexingGatewayForEvent(event: H3Event) {
  return createKnowledgeIndexingGateway({
    repository: getRagRepository(),
    bindings: getCloudflareRuntimeBindings(event.context as { cloudflare?: { env?: unknown } })
  })
}
