import { mkdtemp, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createDemoTenant } from '../../server/lib/demo'
import { createFileStore } from '../../server/lib/storage/file-store'

describe('file store', () => {
  it('persists records to disk and reloads them', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'customer-bot-store-'))
    const filePath = join(dir, 'storage.json')
    const demoTenant = createDemoTenant()
    const firstStore = createFileStore({
      filePath,
      seedTenants: [demoTenant]
    })

    const seededTenant = await firstStore.getTenantById(demoTenant.id)
    expect(seededTenant?.brandName).toBe(demoTenant.brandName)

    await firstStore.saveTenant({
      ...demoTenant,
      contentConfig: {
        knowledgeEntries: [],
        articles: [],
        products: [],
        consultingServices: [],
        contentSources: [
          {
            id: 'source-sheet-1',
            type: 'excel',
            title: 'SKU 参数表',
            sourceLabel: 'sku.csv',
            summary: '导出的产品表格。',
            content: '型号,颜色,库存\nA100,黑色,20',
            tags: ['SKU', '库存'],
            faqQuestions: ['这个 SKU 参数表怎么看？'],
            answerHints: ['先说明字段含义', '再解释库存列']
          }
        ]
      }
    })

    await firstStore.saveSession({
      id: 'session-1',
      tenantId: demoTenant.id,
      visitorId: 'visitor-1',
      startedAt: 1760000000000,
      lastMessageAt: 1760000000000
    })

    await firstStore.saveMessage({
      id: 'message-1',
      sessionId: 'session-1',
      tenantId: demoTenant.id,
      role: 'user',
      content: 'hello',
      createdAt: 1760000000001
    })

    const secondStore = createFileStore({ filePath })
    const session = await secondStore.getSessionById('session-1')
    const messages = await secondStore.listMessagesBySession('session-1')
    const tenant = await secondStore.getTenantById(demoTenant.id)

    expect(session?.tenantId).toBe(demoTenant.id)
    expect(messages).toHaveLength(1)
    expect(messages[0]?.content).toBe('hello')
    expect(tenant?.contentConfig?.contentSources[0]?.type).toBe('excel')
    expect(tenant?.contentConfig?.contentSources[0]?.title).toBe('SKU 参数表')
    expect(tenant?.contentConfig?.contentSources[0]?.faqQuestions).toEqual(['这个 SKU 参数表怎么看？'])
    expect(tenant?.contentConfig?.contentSources[0]?.answerHints).toEqual(['先说明字段含义', '再解释库存列'])

    const storedFile = JSON.parse(await readFile(filePath, 'utf8')) as {
      tenants: Array<{ id: string }>
      sessions: Array<{ id: string }>
      messages: Array<{ id: string }>
    }

    expect(storedFile.tenants.some((item) => item.id === demoTenant.id)).toBe(true)
    expect(storedFile.sessions.some((item) => item.id === 'session-1')).toBe(true)
    expect(storedFile.messages.some((item) => item.id === 'message-1')).toBe(true)
  })
})
