import type { RagRepository } from '../../../../server/lib/repositories/rag-repository.ts'
import type { StorageRepository } from '../../../../server/lib/storage/types.ts'
import { createAgentRuntimeApplication } from './create-agent-runtime-application.ts'
import { createAgentRuntimeHttpLayer } from '../http/routes.ts'

export function createAgentRuntimeHttpAdapter(input: {
  storage: StorageRepository
  ragRepository: RagRepository
  endpoint?: string
  apiKey?: string
  model?: string
  platformEndpoint?: string
  platformApiKey?: string
  platformModel?: string
  fetcher?: typeof fetch
}) {
  const application = createAgentRuntimeApplication(input)
  return createAgentRuntimeHttpLayer(application)
}
