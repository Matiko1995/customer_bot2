import type { ChatRequest } from '../../../packages/contracts/src/agent/chat.contract.ts'
import type { ContactRequest } from '../../../packages/contracts/src/agent/contact.contract.ts'
import { getServiceBaseUrl } from '../../../packages/shared-config/src/service-endpoints.ts'
import { createAgentRuntimeHttpAdapter } from '../../../services/agent-runtime-service/src/infrastructure/create-agent-runtime-http-adapter.ts'
import { requestJson, type GatewayHttpOptions } from './http.ts'
import type { RagRepository } from '../repositories/rag-repository.ts'
import type { StorageRepository } from '../storage/types'

export function createAgentRuntimeGateway(input: {
  storage: StorageRepository
  ragRepository: RagRepository
  baseUrl?: string
  endpoint?: string
  apiKey?: string
  model?: string
  platformEndpoint?: string
  platformApiKey?: string
  platformModel?: string
  fetcher?: typeof fetch
} & GatewayHttpOptions) {
  const baseUrl = input.baseUrl || getServiceBaseUrl('agent-runtime-service')
  const http = createAgentRuntimeHttpAdapter(input)

  return {
    chat(request: ChatRequest) {
      if (baseUrl) {
        return requestJson({
          baseUrl,
          path: '/chat',
          method: 'POST',
          body: request,
          fetcher: input.fetcher
        })
      }

      return http.chat.execute(request)
    },
    contact(request: ContactRequest) {
      if (baseUrl) {
        return requestJson({
          baseUrl,
          path: '/contact',
          method: 'POST',
          body: request,
          fetcher: input.fetcher
        })
      }

      return http.contact.execute(request)
    }
  }
}
