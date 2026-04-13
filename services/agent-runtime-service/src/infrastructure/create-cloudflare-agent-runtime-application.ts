import type { ChatRequest, ChatResponse } from '../../../../packages/contracts/src/agent/chat.contract.ts'
import type { ContactRequest, ContactResponse } from '../../../../packages/contracts/src/agent/contact.contract.ts'
import type { CloudflareRuntimeBindings } from '../../../../server/lib/cloudflare/bindings.ts'
import { getCloudflareRuntimeBindings } from '../../../../server/lib/cloudflare/runtime.ts'
import { processChatMessage } from '../../../../server/lib/chat.ts'
import { createDeterministicEmbedding } from '../../../../server/lib/ingestion/embed-chunks.ts'
import { retrieveForTenantWithVectorIndex } from '../../../../server/lib/vector-index/retrieve-for-tenant.ts'
import { createVectorIndexProvider } from '../../../../server/lib/vector-index/vector-index-provider.ts'
import { resolveTenant } from '../../../../server/lib/tenant-resolver.ts'
import { AgentRuntimeApplication } from '../agent-runtime.application.ts'
import { D1AgentRuntimeStorageRepository } from './d1-agent-runtime-storage.repository.ts'
import { D1KnowledgeIndexingRepository } from '../../../knowledge-indexing-service/src/infrastructure/d1-knowledge-indexing.repository.ts'

async function submitLead(input: ContactRequest, storage: D1AgentRuntimeStorageRepository): Promise<ContactResponse> {
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

export function createCloudflareAgentRuntimeApplication(bindings?: CloudflareRuntimeBindings) {
  const runtimeBindings = getCloudflareRuntimeBindings(bindings)
  if (!runtimeBindings?.TENANT_IDENTITY_DB) {
    throw new Error('TENANT_IDENTITY_DB binding is required')
  }

  const storage = new D1AgentRuntimeStorageRepository(runtimeBindings.TENANT_IDENTITY_DB)
  const indexingRepository = new D1KnowledgeIndexingRepository(runtimeBindings.TENANT_IDENTITY_DB)
  const vectorIndex = createVectorIndexProvider(runtimeBindings)

  return new AgentRuntimeApplication({
    processChatMessage: (request: ChatRequest): Promise<ChatResponse> =>
      processChatMessage(request, {
        storage,
        ragRepository: {
          saveDataSource: async () => {},
          getDataSourceById: async () => undefined,
          listDataSourcesByTenant: async () => [],
          saveIngestionJob: async () => {},
          getIngestionJobById: async () => undefined,
          listIngestionJobsByTenant: async () => [],
          saveDocument: async () => {},
          getDocumentById: async () => undefined,
          listDocumentsByTenant: (tenantId: string) => indexingRepository.listSourceDocumentsByTenant(tenantId),
          replaceDocumentChunks: async () => {},
          listChunksByDocument: (documentId: string) => indexingRepository.listDocumentChunksByDocument(documentId)
        },
        embedQuery: async (query: string) => createDeterministicEmbedding(query),
        customRetriever: ({ tenantId, queryEmbedding, topK }) =>
          retrieveForTenantWithVectorIndex({
            tenantId,
            queryVector: queryEmbedding || [],
            topK,
            repository: indexingRepository,
            vectorIndex
          })
      }),
    submitLead: (request: ContactRequest) => submitLead(request, storage)
  })
}
