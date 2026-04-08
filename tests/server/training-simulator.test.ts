import { describe, expect, it } from 'vitest'
import { listTrainingRuns } from '../../lib/training-runs'
import { estimateTrainingRun, simulateTenantTraining } from '../../server/lib/training-simulator'
import { createMemoryStore } from '../../server/lib/storage/memory-store'
import type { TenantRecord } from '../../types'

function createTenant(): TenantRecord {
  return {
    id: 'tenant-train',
    name: '训练租户',
    status: 'active',
    brandName: '训练租户品牌',
    themeColor: '#118ab2',
    contactPhone: '13800000000',
    contactEmail: 'train@example.com',
    contactAddress: 'Shanghai',
    systemPrompt: 'You are a helpful bot.',
    embedKey: 'embed-train',
    billingSubscription: {
      planId: 'plan-basic',
      startedAt: Date.UTC(2026, 2, 1),
      notes: ''
    },
    contentConfig: {
      knowledgeEntries: [],
      articles: [],
      products: [],
      consultingServices: [],
      contentSources: [
        {
          id: 'source-1',
          type: 'document',
          enabled: true,
          category: 'manual',
          title: '部署手册',
          sourceLabel: 'deploy.md',
          sourceUrl: '',
          summary: '介绍部署流程',
          content: '第一步连接数据库。第二步导入配置。第三步验证服务状态。',
          tags: ['部署']
        },
        {
          id: 'source-2',
          type: 'excel',
          enabled: true,
          category: 'pricing',
          title: 'SKU 参数表',
          sourceLabel: 'sku.csv',
          sourceUrl: '',
          summary: '包含型号和参数',
          content: '型号,功率,电压\nA100,10kW,220V\nA200,15kW,380V',
          tags: ['参数']
        }
      ]
    },
    createdAt: Date.UTC(2026, 2, 1),
    updatedAt: Date.UTC(2026, 2, 1)
  }
}

describe('training simulator', () => {
  it('estimates token usage from enabled content sources', () => {
    const tenant = createTenant()
    const result = estimateTrainingRun(tenant)

    expect(result.sourceCount).toBe(2)
    expect(result.characterCount).toBeGreaterThan(30)
    expect(result.inputTokens).toBeGreaterThan(0)
    expect(result.totalTokens).toBe(result.inputTokens + result.outputTokens)
    expect(result.amount).toMatch(/^\d+\.\d{2}$/)
  })

  it('writes a simulated training usage record to storage', async () => {
    const tenant = createTenant()
    const store = createMemoryStore()
    await store.saveTenant(tenant)

    const result = await simulateTenantTraining({
      tenant,
      storage: store,
      now: Date.UTC(2026, 2, 21, 8, 0, 0)
    })

    expect(result.record.tenantId).toBe('tenant-train')
    expect(result.record.sessionId).toContain('training-tenant-train-')
    expect(result.record.provider).toBe('training-simulator')
    expect(result.record.model).toBe('training-indexer-v1')
    expect(result.record.totalTokens).toBeGreaterThan(0)

    const usageRecords = await store.listUsageByTenant('tenant-train')
    expect(usageRecords).toHaveLength(1)
    expect(usageRecords[0]).toMatchObject({
      tenantId: 'tenant-train',
      provider: 'training-simulator',
      model: 'training-indexer-v1',
      status: 'success'
    })
  })

  it('lists training runs in reverse chronological order', () => {
    const runs = listTrainingRuns([
      {
        id: 'usage-chat',
        tenantId: 'tenant-train',
        sessionId: 'session-chat-1',
        provider: 'openai-compatible',
        model: 'gpt-4o-mini',
        inputTokens: 100,
        outputTokens: 80,
        totalTokens: 180,
        amount: '0.02',
        status: 'success',
        createdAt: 10
      },
      {
        id: 'usage-training-1',
        tenantId: 'tenant-train',
        sessionId: 'training-tenant-train-1',
        provider: 'training-simulator',
        model: 'training-indexer-v1',
        inputTokens: 300,
        outputTokens: 96,
        totalTokens: 396,
        amount: '0.05',
        status: 'success',
        createdAt: 20
      },
      {
        id: 'usage-training-2',
        tenantId: 'tenant-train',
        sessionId: 'training-tenant-train-2',
        provider: 'training-simulator',
        model: 'training-indexer-v1',
        inputTokens: 420,
        outputTokens: 96,
        totalTokens: 516,
        amount: '0.06',
        status: 'success',
        createdAt: 30
      }
    ])

    expect(runs).toHaveLength(2)
    expect(runs[0]).toMatchObject({
      id: 'usage-training-2',
      sessionId: 'training-tenant-train-2',
      totalTokens: 516
    })
    expect(runs[1].id).toBe('usage-training-1')
  })
})
