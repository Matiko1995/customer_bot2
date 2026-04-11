import assert from 'node:assert/strict'
import { createMemoryStore } from '../server/lib/storage/memory-store.ts'
import { createInMemoryRagRepository } from '../server/lib/repositories/rag-repository.ts'
import { processChatMessage } from '../server/lib/chat.ts'
import { createDefaultTenantRagSettings } from '../packages/shared-config/src/rag-settings.ts'

async function createTenant(store: ReturnType<typeof createMemoryStore>) {
  await store.saveTenant({
    id: 'tenant-1',
    name: 'Tenant 1',
    status: 'active',
    brandName: 'Tenant Bot',
    themeColor: '#118ab2',
    contactPhone: '13800000000',
    contactEmail: 'tenant@example.com',
    contactAddress: 'Shanghai',
    systemPrompt: 'You are the tenant bot.',
    embedKey: 'embed-tenant-1',
    ragSettings: {
      ...createDefaultTenantRagSettings(),
      enabled: true
    },
    contentConfig: {
      knowledgeEntries: [
        {
          id: 'faq-1',
          title: 'IMAP 支持说明',
          keywords: ['IMAP'],
          oneLiner: '支持 IMAP。',
          whatIs: '系统支持 IMAP。',
          problems: ['邮件接入'],
          workflow: ['配置邮箱', '开始同步'],
          scenarios: ['邮件资料接入'],
          outcomes: ['邮件可进入知识库'],
          source: 'tenant-content'
        }
      ],
      articles: [],
      products: [
        {
          id: 'product-1',
          name: '示例产品',
          category: '设备',
          summary: '测试产品',
          priceText: '¥100 / 台'
        }
      ],
      consultingServices: [],
      contentSources: []
    },
    createdAt: 1,
    updatedAt: 1
  })
}

async function createRagData(repository: ReturnType<typeof createInMemoryRagRepository>) {
  await repository.saveDocument({
    id: 'doc-1',
    tenantId: 'tenant-1',
    dataSourceId: 'source-1',
    title: '部署手册',
    mimeType: 'text/plain',
    sourceUri: 'file://deploy.txt',
    contentText: '系统支持 API 对接与部署流程配置。',
    metadata: {},
    contentHash: 'hash-1',
    versionHash: 'version-1',
    createdAt: 1,
    updatedAt: 1
  })

  await repository.replaceDocumentChunks('doc-1', [
    {
      id: 'chunk-1',
      tenantId: 'tenant-1',
      documentId: 'doc-1',
      chunkIndex: 0,
      content: '系统支持 API 对接与部署流程配置。',
      tokenCount: 4,
      metadata: {},
      createdAt: 1
    }
  ])
}

async function latestAssistant(store: ReturnType<typeof createMemoryStore>, sessionId: string) {
  const messages = await store.listMessagesBySession(sessionId)
  const assistants = messages.filter((message) => message.role === 'assistant')
  return assistants[assistants.length - 1]
}

async function usageRecords(store: ReturnType<typeof createMemoryStore>) {
  return store.listUsageByTenant('tenant-1')
}

async function main() {
  const store = createMemoryStore()
  const ragRepository = createInMemoryRagRepository()
  await createTenant(store)
  await createRagData(ragRepository)

  const structured = await processChatMessage(
    { tenantId: 'tenant-1', message: '这个产品多少钱？' },
    { storage: store, ragRepository }
  )
  const structuredAssistant = await latestAssistant(store, structured.sessionId)
  assert.equal(structured.answerSource, 'structured')
  assert.equal(structuredAssistant?.answerSource, 'structured')
  assert.equal(structuredAssistant?.credentialSource, 'tenant')

  const rag = await processChatMessage(
    { tenantId: 'tenant-1', message: '支持 API 对接吗？' },
    { storage: store, ragRepository }
  )
  const ragAssistant = await latestAssistant(store, rag.sessionId)
  assert.equal(rag.answerSource, 'rag')
  assert.equal(ragAssistant?.answerSource, 'rag')
  assert.equal(ragAssistant?.credentialSource, 'tenant')
  assert.equal(ragAssistant?.citations?.length, 1)

  const fallback = await processChatMessage(
    { tenantId: 'tenant-1', message: '你们适合哪些行业？' },
    { storage: store, ragRepository }
  )
  const fallbackAssistant = await latestAssistant(store, fallback.sessionId)
  const usageAfterFallback = await usageRecords(store)
  const fallbackUsage = usageAfterFallback[usageAfterFallback.length - 1]
  assert.equal(fallback.answerSource, 'general_fallback')
  assert.equal(fallback.credentialSource, 'platform_shared')
  assert.equal(fallbackAssistant?.answerSource, 'general_fallback')
  assert.equal(fallbackAssistant?.credentialSource, 'platform_shared')
  assert.equal(fallbackUsage?.answerSource, 'general_fallback')
  assert.equal(fallbackUsage?.credentialSource, 'platform_shared')

  const reusedFallback = await processChatMessage(
    { tenantId: 'tenant-1', message: '你们适合哪些行业？' },
    { storage: store, ragRepository }
  )
  const reusedAssistant = await latestAssistant(store, reusedFallback.sessionId)
  assert.equal(reusedFallback.answerSource, 'general_fallback')
  assert.equal(reusedFallback.credentialSource, 'platform_shared')
  assert.equal(reusedAssistant?.answerSource, 'general_fallback')
  assert.equal(reusedAssistant?.credentialSource, 'platform_shared')

  console.log('chat persistence verified')
}

void main()
