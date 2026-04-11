import assert from 'node:assert/strict'
import { createDemoTenant } from '../server/lib/demo.ts'
import { createMemoryStore } from '../server/lib/storage/memory-store.ts'
import { createInMemoryRagRepository } from '../server/lib/repositories/rag-repository.ts'
import { createTenantIdentityApplication } from '../services/tenant-identity-service/src/infrastructure/create-tenant-identity-application.ts'
import { processChatMessage } from '../server/lib/chat.ts'

async function verifyDefaultTenantSettings() {
  const demoTenant = createDemoTenant()
  assert.equal(demoTenant.ragSettings?.enabled, false)
  assert.equal(typeof demoTenant.ragSettings?.chunkSize, 'number')
}

async function verifyTenantUpdatePersistsSettings() {
  const store = createMemoryStore()
  const app = createTenantIdentityApplication(store)

  await app.createTenant({
    id: 'tenant-rag-settings',
    name: 'Tenant RAG Settings',
    contactEmail: 'rag-settings@example.com'
  })

  await app.updateTenant('tenant-rag-settings', {
    ragSettings: {
      enabled: true,
      industryPreset: 'fastener',
      chunkSize: 640,
      chunkOverlap: 96,
      retrievalTopK: 6,
      ingestionStructureTemplate: '产品名称\n标准\n材质\n规格',
      answerStructureTemplate: '结论\n规格\n材质\n来源',
      retrievalPromptTemplate: '请基于资料回答：{{query}}',
      fallbackPromptTemplate: '当前未命中资料：{{query}}'
    }
  })

  const tenant = await app.getTenant('tenant-rag-settings')
  assert.equal(tenant.item.ragSettings?.enabled, true)
  assert.equal(tenant.item.ragSettings?.chunkSize, 640)
  assert.equal(tenant.item.ragSettings?.chunkOverlap, 96)
  assert.equal(tenant.item.ragSettings?.industryPreset, 'fastener')
}

async function verifyDisabledRagSkipsRetrieval() {
  const store = createMemoryStore()
  const ragRepository = createInMemoryRagRepository()

  await store.saveTenant({
    id: 'tenant-rag-off',
    name: 'Tenant RAG Off',
    status: 'active',
    brandName: 'Tenant RAG Off',
    themeColor: '#118ab2',
    contactPhone: '13800000000',
    contactEmail: 'rag-off@example.com',
    contactAddress: 'Shanghai',
    systemPrompt: 'You are the tenant bot.',
    embedKey: 'embed-rag-off',
    ragSettings: {
      enabled: false,
      industryPreset: 'general',
      chunkSize: 500,
      chunkOverlap: 80,
      retrievalTopK: 3,
      ingestionStructureTemplate: '标题\n摘要\n关键信息',
      answerStructureTemplate: '结论\n依据\n来源',
      retrievalPromptTemplate: '请根据资料回答：{{query}}',
      fallbackPromptTemplate: '未命中资料时谨慎回答：{{query}}'
    },
    contentConfig: {
      knowledgeEntries: [],
      articles: [],
      products: [],
      consultingServices: [],
      contentSources: []
    },
    createdAt: 1,
    updatedAt: 1
  })

  await ragRepository.saveDocument({
    id: 'doc-rag-off',
    tenantId: 'tenant-rag-off',
    dataSourceId: 'source-rag-off',
    title: '紧固件参数说明',
    mimeType: 'text/plain',
    sourceUri: 'file://rag-off.txt',
    contentText: '本文件包含紧固件规格、材质和强度等级说明。',
    metadata: {},
    contentHash: 'hash-rag-off',
    versionHash: 'version-rag-off',
    createdAt: 1,
    updatedAt: 1
  })

  await ragRepository.replaceDocumentChunks('doc-rag-off', [
    {
      id: 'chunk-rag-off',
      tenantId: 'tenant-rag-off',
      documentId: 'doc-rag-off',
      chunkIndex: 0,
      content: '本文件包含紧固件规格、材质和强度等级说明。',
      tokenCount: 8,
      metadata: {},
      createdAt: 1
    }
  ])

  const response = await processChatMessage(
    {
      tenantId: 'tenant-rag-off',
      message: '你们的紧固件规格有哪些？'
    },
    {
      storage: store,
      ragRepository
    }
  )

  assert.equal(response.answerSource, 'general_fallback')
  assert.equal(response.citations.length, 0)
}

async function main() {
  await verifyDefaultTenantSettings()
  await verifyTenantUpdatePersistsSettings()
  await verifyDisabledRagSkipsRetrieval()
  console.log('rag settings verified')
}

void main()
