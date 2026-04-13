import type { RagRepository } from '../../../../server/lib/repositories/rag-repository.ts'
import type { StorageRepository } from '../../../../server/lib/storage/types.ts'
import type { CloudflareRuntimeBindings } from '../../../../server/lib/cloudflare/bindings.ts'
import { createAgentRuntimeApplication } from './create-agent-runtime-application.ts'
import { createCloudflareAgentRuntimeApplication } from './create-cloudflare-agent-runtime-application.ts'
import { createAgentRuntimeHttpLayer } from '../http/routes.ts'

export function createAgentRuntimeHttpAdapter(input: {
  storage?: StorageRepository
  ragRepository?: RagRepository
  bindings?: CloudflareRuntimeBindings
  endpoint?: string
  apiKey?: string
  model?: string
  platformEndpoint?: string
  platformApiKey?: string
  platformModel?: string
  fetcher?: typeof fetch
}) {
  const application = input.bindings?.TENANT_IDENTITY_DB
    ? createCloudflareAgentRuntimeApplication(input.bindings)
    : createAgentRuntimeApplication(input as {
        storage: StorageRepository
        ragRepository: RagRepository
        endpoint?: string
        apiKey?: string
        model?: string
        platformEndpoint?: string
        platformApiKey?: string
        platformModel?: string
        fetcher?: typeof fetch
      })
  return createAgentRuntimeHttpLayer(application)
}
