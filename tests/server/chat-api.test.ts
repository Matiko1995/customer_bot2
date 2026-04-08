import { describe, expect, it, vi } from 'vitest'
import { createMemoryStore } from '../../server/lib/storage/memory-store'
import { processChatMessage } from '../../server/lib/chat'

describe('chat service', () => {
  it('creates a session, stores messages, and records usage', async () => {
    const store = createMemoryStore()

    await store.saveTenant({
      id: 'tenant-1',
      name: 'Tenant 1',
      status: 'active',
      brandName: 'Tenant 1 Bot',
      themeColor: '#118ab2',
      contactPhone: '+86 138-0000-0000',
      contactEmail: 'tenant1@example.com',
      contactAddress: 'Shanghai',
      systemPrompt: 'You are the tenant bot.',
      embedKey: 'embed-tenant-1',
      createdAt: 1760000000000,
      updatedAt: 1760000000000
    })

    const result = await processChatMessage(
      {
        tenantId: 'tenant-1',
        message: '你好'
      },
      {
        storage: store,
        endpoint: 'https://example.com/chat',
        apiKey: 'test-key',
        model: 'gpt-test',
        fetcher: vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: '您好，这里是 AI 客服。' } }],
            usage: {
              prompt_tokens: 12,
              completion_tokens: 8,
              total_tokens: 20
            }
          })
        })
      }
    )

    expect(result.reply).toBe('您好，这里是 AI 客服。')
    expect(result.sessionId).toBeTruthy()
    expect(result.usage.totalTokens).toBe(20)
  })

  it('stores uploaded attachments with the user message', async () => {
    const store = createMemoryStore()

    await store.saveTenant({
      id: 'tenant-1',
      name: 'Tenant 1',
      status: 'active',
      brandName: 'Tenant 1 Bot',
      themeColor: '#118ab2',
      contactPhone: '+86 138-0000-0000',
      contactEmail: 'tenant1@example.com',
      contactAddress: 'Shanghai',
      systemPrompt: 'You are the tenant bot.',
      embedKey: 'embed-tenant-1',
      createdAt: 1760000000000,
      updatedAt: 1760000000000
    })

    const result = await processChatMessage(
      {
        tenantId: 'tenant-1',
        message: '我上传了一张截图',
        attachments: [
          {
            id: 'attachment-1',
            name: 'screenshot.png',
            mimeType: 'image/png',
            size: 1024,
            dataUrl: 'data:image/png;base64,abc'
          }
        ]
      },
      {
        storage: store
      }
    )

    const messages = await store.listMessagesBySession(result.sessionId)
    expect(messages[0]?.attachments).toHaveLength(1)
    expect(messages[0]?.attachments?.[0]?.name).toBe('screenshot.png')
    expect(result.reply).toContain('【已收到附件】')
  })

  it('reuses an existing session and sends prior history to the llm adapter', async () => {
    const store = createMemoryStore()

    await store.saveTenant({
      id: 'tenant-1',
      name: 'Tenant 1',
      status: 'active',
      brandName: 'Tenant 1 Bot',
      themeColor: '#118ab2',
      contactPhone: '+86 138-0000-0000',
      contactEmail: 'tenant1@example.com',
      contactAddress: 'Shanghai',
      systemPrompt: 'You are the tenant bot.',
      embedKey: 'embed-tenant-1',
      createdAt: 1760000000000,
      updatedAt: 1760000000000
    })

    await store.saveSession({
      id: 'session-1',
      tenantId: 'tenant-1',
      visitorId: 'visitor-1',
      startedAt: 1760000000000,
      lastMessageAt: 1760000000000
    })

    await store.saveMessage({
      id: 'message-1',
      sessionId: 'session-1',
      tenantId: 'tenant-1',
      role: 'user',
      content: '前一条消息',
      createdAt: 1760000000000
    })

    await store.saveMessage({
      id: 'message-2',
      sessionId: 'session-1',
      tenantId: 'tenant-1',
      role: 'assistant',
      content: '前一条回复',
      createdAt: 1760000001000
    })

    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '新的回复' } }],
        usage: {
          prompt_tokens: 6,
          completion_tokens: 4,
          total_tokens: 10
        }
      })
    })

    const result = await processChatMessage(
      {
        tenantId: 'tenant-1',
        sessionId: 'session-1',
        message: '继续聊'
      },
      {
        storage: store,
        endpoint: 'https://example.com/chat',
        apiKey: 'test-key',
        model: 'gpt-test',
        fetcher
      }
    )

    expect(result.sessionId).toBe('session-1')

    const request = fetcher.mock.calls[0]?.[1]
    const body = JSON.parse(String(request?.body))

    expect(body.messages[0]?.role).toBe('system')
    expect(body.messages[0]?.content).toContain('You are the tenant bot.')
    expect(body.messages[0]?.content).toContain('你必须优先依据已提供的命中资料回答')
    expect(body.messages[1]).toEqual({ role: 'user', content: '前一条消息' })
    expect(body.messages[2]).toEqual({ role: 'assistant', content: '前一条回复' })
    expect(body.messages[3]?.role).toBe('user')
    expect(body.messages[3]?.content).toContain('继续聊')
  })

  it('passes retrieval context and attachment note to the llm request', async () => {
    const store = createMemoryStore()

    await store.saveTenant({
      id: 'tenant-1',
      name: 'Tenant 1',
      status: 'active',
      brandName: 'Tenant 1 Bot',
      themeColor: '#118ab2',
      contactPhone: '+86 138-0000-0000',
      contactEmail: 'tenant1@example.com',
      contactAddress: 'Shanghai',
      systemPrompt: 'You are the tenant bot.',
      embedKey: 'embed-tenant-1',
      createdAt: 1760000000000,
      updatedAt: 1760000000000
    })

    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '新的回复' } }],
        usage: {
          prompt_tokens: 6,
          completion_tokens: 4,
          total_tokens: 10
        }
      })
    })

    await processChatMessage(
      {
        tenantId: 'tenant-1',
        message: '六角头螺栓多少钱？',
        attachments: [
          {
            id: 'attachment-1',
            name: 'bolt.png',
            mimeType: 'image/png',
            size: 2048,
            dataUrl: 'data:image/png;base64,abc'
          }
        ]
      },
      {
        storage: store,
        endpoint: 'https://example.com/chat',
        apiKey: 'test-key',
        model: 'gpt-test',
        fetcher
      }
    )

    const request = fetcher.mock.calls[0]?.[1]
    const body = JSON.parse(String(request?.body))
    expect(body.messages[1]?.content).toContain('六角头螺栓多少钱？')
    expect(body.messages[1]?.content).toContain('已收到附件')
    expect(body.messages[1]?.content).toContain('参数')
    expect(body.messages[0]?.content).toContain('你必须优先依据已提供的命中资料回答')
    expect(body.messages[0]?.content).toContain('禁止输出资料之外的价格区间或估算')
  })

  it('prefers tenant-specific content when available', async () => {
    const store = createMemoryStore()

    await store.saveTenant({
      id: 'tenant-knowledge',
      name: 'Tenant Knowledge',
      status: 'active',
      brandName: 'Tenant Knowledge Bot',
      themeColor: '#118ab2',
      contactPhone: '+86 138-0000-0000',
      contactEmail: 'tenant@example.com',
      contactAddress: 'Shanghai',
      systemPrompt: 'You are the tenant bot.',
      embedKey: 'embed-tenant-knowledge',
      contentConfig: {
        knowledgeEntries: [
          {
            id: 'tenant-faq-1',
            title: '客户专属知识库',
            keywords: ['专属知识', '客户知识库'],
            oneLiner: '这是客户自己的知识条目。',
            whatIs: '用于验证租户详情页保存的内容会直接参与回答。',
            problems: ['默认演示内容不够准确'],
            workflow: ['维护租户内容', '保存到 contentConfig', '回答优先使用租户内容'],
            scenarios: ['租户希望覆盖默认文案'],
            outcomes: ['回答更贴合租户实际内容'],
            source: 'tenant-content'
          }
        ],
        articles: [],
        products: [],
        consultingServices: [],
        contentSources: []
      },
      createdAt: 1760000000000,
      updatedAt: 1760000000000
    })

    const result = await processChatMessage(
      {
        tenantId: 'tenant-knowledge',
        message: '请介绍一下客户专属知识库'
      },
      {
        storage: store
      }
    )

    expect(result.reply).toContain('客户专属知识库')
    expect(result.reply).toContain('这是客户自己的知识条目')
  })

  it('stores matched knowledge source metadata', async () => {
    const store = createMemoryStore()

    await store.saveTenant({
      id: 'tenant-metadata',
      name: 'Tenant Metadata',
      status: 'active',
      brandName: 'Tenant Metadata Bot',
      themeColor: '#118ab2',
      contactPhone: '+86 138-0000-0000',
      contactEmail: 'tenant-metadata@example.com',
      contactAddress: 'Shanghai',
      systemPrompt: 'You are the tenant bot.',
      embedKey: 'embed-tenant-metadata',
      contentConfig: {
        knowledgeEntries: [
          {
            id: 'standard-reply-1',
            title: '客户专属知识库｜标准回复',
            keywords: ['客户专属知识库', '专属知识'],
            oneLiner: '标准回复条目',
            whatIs: '标准口径：这是客户专属知识库的固定口径。',
            problems: ['高频问题'],
            workflow: ['直接回复标准口径'],
            scenarios: ['客户专属知识库'],
            outcomes: ['统一口径'],
            source: 'faq-standard-reply'
          }
        ],
        articles: [],
        products: [],
        consultingServices: [],
        contentSources: []
      },
      createdAt: 1760000000000,
      updatedAt: 1760000000000
    })

    const result = await processChatMessage({ tenantId: 'tenant-metadata', message: '请介绍客户专属知识库' }, { storage: store })
    const messages = await store.listMessagesBySession(result.sessionId)
    const assistant = messages.find((item) => item.role === 'assistant')

    expect(assistant?.matchedContentSources?.some((item) => item.title.includes('客户专属知识库｜标准回复'))).toBe(true)
  })

  it('stores matched content snippet and answer hints for trace view', async () => {
    const store = createMemoryStore()

    await store.saveTenant({
      id: 'tenant-trace',
      name: 'Tenant Trace',
      status: 'active',
      brandName: 'Tenant Trace Bot',
      themeColor: '#118ab2',
      contactPhone: '+86 138-0000-0000',
      contactEmail: 'tenant-trace@example.com',
      contactAddress: 'Shanghai',
      systemPrompt: 'You are the tenant bot.',
      embedKey: 'embed-tenant-trace',
      contentConfig: {
        knowledgeEntries: [],
        articles: [],
        products: [],
        consultingServices: [],
        contentSources: [
          {
            id: 'source-api',
            type: 'document',
            enabled: true,
            category: '交付',
            title: 'API 接口说明',
            summary: '接口能力说明。',
            content: '系统支持 API 对接、Webhook 回调以及 ERP / MES 字段映射。',
            tags: ['API'],
            faqQuestions: ['支持 API 对接吗？'],
            answerHints: ['先确认支持 API', '说明可对接 ERP / MES']
          }
        ]
      },
      createdAt: 1760000000000,
      updatedAt: 1760000000000
    })

    const result = await processChatMessage({ tenantId: 'tenant-trace', message: '支持 API 对接吗？' }, { storage: store })
    const messages = await store.listMessagesBySession(result.sessionId)
    const assistant = messages.find((item) => item.role === 'assistant')
    const source = assistant?.matchedContentSources?.find((item) => item.id === 'source-api')

    expect(source?.snippet).toContain('系统支持 API 对接')
    expect(source?.answerHints).toEqual(['先确认支持 API', '说明可对接 ERP / MES'])
  })

  it('does not reuse previous answer when tenant reuse toggle is disabled', async () => {
    const store = createMemoryStore()

    await store.saveTenant({
      id: 'tenant-no-reuse',
      name: 'Tenant No Reuse',
      status: 'active',
      brandName: 'Tenant No Reuse Bot',
      themeColor: '#118ab2',
      contactPhone: '+86 138-0000-0000',
      contactEmail: 'tenant-no-reuse@example.com',
      contactAddress: 'Shanghai',
      systemPrompt: 'You are the tenant bot.',
      embedKey: 'embed-tenant-no-reuse',
      reuseAnsweredQuestions: false,
      createdAt: 1760000000000,
      updatedAt: 1760000000000
    })

    await processChatMessage(
      {
        tenantId: 'tenant-no-reuse',
        message: '价格多少？'
      },
      {
        storage: store,
        endpoint: 'https://example.com/chat',
        apiKey: 'test-key',
        model: 'gpt-test',
        fetcher: vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: '第一次回复' } }],
            usage: { prompt_tokens: 5, completion_tokens: 5, total_tokens: 10 }
          })
        })
      }
    )

    const secondFetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '第二次重新生成的回复' } }],
        usage: { prompt_tokens: 7, completion_tokens: 6, total_tokens: 13 }
      })
    })

    const result = await processChatMessage(
      {
        tenantId: 'tenant-no-reuse',
        message: '价格多少？'
      },
      {
        storage: store,
        endpoint: 'https://example.com/chat',
        apiKey: 'test-key',
        model: 'gpt-test',
        fetcher: secondFetcher
      }
    )

    expect(result.reply).toBe('第二次重新生成的回复')
    expect(secondFetcher).toHaveBeenCalledTimes(1)
  })
})
