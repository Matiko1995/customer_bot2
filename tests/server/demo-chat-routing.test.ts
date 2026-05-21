import { describe, expect, it } from 'vitest'
import { createDemoTenant } from '../../server/lib/demo'
import { processChatMessage } from '../../server/lib/chat'
import { createMemoryStore } from '../../server/lib/storage/memory-store'

describe('demo chat routing', () => {
  it('answers generic service introductions with demo structured content', async () => {
    const store = createMemoryStore()
    const demoTenant = createDemoTenant()

    await store.saveTenant({
      ...demoTenant,
      contentConfig: {
        knowledgeEntries: [],
        articles: [],
        products: [],
        consultingServices: [],
        contentSources: []
      },
      ragSettings: {
        ...demoTenant.ragSettings!,
        enabled: false
      }
    })

    const result = await processChatMessage(
      {
        tenantId: 'tenant-demo',
        message: '请介绍你们的服务'
      },
      {
        storage: store
      }
    )

    expect(result.answerSource).toBe('structured')
    expect(result.reply).toContain('【服务简介】')
    expect(result.reply).toContain('智能仓储')
    expect(result.reply).not.toContain('当前资料未直接命中，以下为通用参考答复')
  })
})
