import assert from 'node:assert/strict'
import type { TenantRecord } from '../types'
import { applyTenantRagPreset, createDefaultTenantRagSettings } from '../packages/shared-config/src/rag-settings.ts'
import { buildFastenerTenantContentUpdate } from '../server/lib/industry-packs/fastener-pack.ts'

function createTenant(): TenantRecord {
  return {
    id: 'tenant-fastener',
    name: 'Fastener Tenant',
    status: 'active',
    brandName: 'Fastener Tenant',
    themeColor: '#118ab2',
    contactPhone: '13800000000',
    contactEmail: 'fastener@example.com',
    contactAddress: 'Suzhou',
    systemPrompt: 'You are the tenant bot.',
    embedKey: 'embed-fastener',
    ragSettings: createDefaultTenantRagSettings(),
    contentConfig: {
      knowledgeEntries: [
        {
          id: 'legacy-knowledge',
          title: '旧知识',
          keywords: ['旧'],
          oneLiner: '旧知识条目',
          whatIs: '旧知识说明',
          problems: ['旧问题'],
          workflow: ['旧流程'],
          scenarios: ['旧场景'],
          outcomes: ['旧结果'],
          source: 'legacy'
        }
      ],
      articles: [],
      products: [],
      consultingServices: [],
      contentSources: []
    },
    createdAt: 1,
    updatedAt: 1
  }
}

async function main() {
  const existing = createTenant()
  const updated = await buildFastenerTenantContentUpdate(existing)

  assert.equal(updated.id, existing.id)
  assert.equal(updated.embedKey, existing.embedKey)
  assert.equal(updated.ragSettings?.industryPreset, 'fastener')
  assert.equal(updated.ragSettings?.enabled, false)
  assert.equal(updated.contentConfig?.knowledgeEntries.length ? updated.contentConfig.knowledgeEntries.length >= 6 : false, true)
  assert.equal(updated.contentConfig?.products.length ? updated.contentConfig.products.length >= 6 : false, true)
  assert.equal(updated.contentConfig?.articles.length ? updated.contentConfig.articles.length >= 5 : false, true)
  assert.equal(updated.contentConfig?.contentSources.length ? updated.contentConfig.contentSources.length >= 4 : false, true)
  assert.equal(updated.contentConfig?.knowledgeEntries.some((item) => item.id === 'legacy-knowledge'), false)
  assert.equal(updated.contentConfig?.contentSources.some((item) => item.title.includes('紧固件标准体系')), true)
  assert.equal(updated.updatedAt > existing.updatedAt, true)

  console.log('fastener import verified')
}

void main()
