import type { ChatRequest, ChatResponse } from '../../../../packages/contracts/src/agent/chat.contract.ts'
import type { ContactRequest, ContactResponse } from '../../../../packages/contracts/src/agent/contact.contract.ts'
import { processChatMessage } from '../../../../server/lib/chat.ts'
import type { RagRepository } from '../../../../server/lib/repositories/rag-repository.ts'
import { resolveTenant } from '../../../../server/lib/tenant-resolver.ts'
import type { StorageRepository } from '../../../../server/lib/storage/types.ts'
import { AgentRuntimeApplication } from '../agent-runtime.application.ts'

async function submitLead(input: ContactRequest, storage: StorageRepository): Promise<ContactResponse> {
  const tenant = await resolveTenant(input.tenantId, storage)

  if (!tenant) {
    throw new Error('Tenant not found')
  }

  const leadId = `lead-${Date.now()}`
  await storage.saveLead({
    id: leadId,
    tenantId: tenant.id,
    sessionId: input.sessionId || '',
    name: input.name,
    company: input.company,
    contact: input.contact,
    demandType: input.demandType,
    message: input.message || '',
    createdAt: Date.now()
  })

  return {
    ok: true,
    id: leadId,
    message: '提交成功，我们会在 1 个工作日内联系你。'
  }
}

export function createAgentRuntimeApplication(input: {
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
  return new AgentRuntimeApplication({
    processChatMessage: (request: ChatRequest): Promise<ChatResponse> =>
      processChatMessage(request, {
        storage: input.storage,
        ragRepository: input.ragRepository,
        endpoint: input.endpoint,
        apiKey: input.apiKey,
        model: input.model,
        platformEndpoint: input.platformEndpoint,
        platformApiKey: input.platformApiKey,
        platformModel: input.platformModel,
        fetcher: input.fetcher
      }),
    submitLead: (request: ContactRequest) => submitLead(request, input.storage)
  })
}
