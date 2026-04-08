import { assistantKnowledgeEntries } from '../../config/ai-assistant-knowledge'
import { demoArticles, demoConsultingServices, demoProducts, demoSiteConfig } from '../../config/customer-bot-data'
import { buildAssistantReply, pickMatchedContentSources, toMatchedContentSourceReferences } from '../../lib/customer-bot'
import type { MessageAttachment } from '../../types'
import { createLlmAdapter } from '../../src/llm-adapter'
import type { StorageRepository } from './storage/types'
import { getStorage } from './storage'
import { TenantNotFoundError } from './tenants'
import { resolveTenant } from './tenant-resolver'

export interface ProcessChatMessageInput {
  tenantId: string
  message: string
  sessionId?: string
  attachments?: MessageAttachment[]
}

export interface ProcessChatMessageOptions {
  storage?: StorageRepository
  endpoint?: string
  apiKey?: string
  model?: string
  fetcher?: typeof fetch
}

export class SessionNotFoundError extends Error {
  code = 'SESSION_NOT_FOUND' as const

  constructor(sessionId: string) {
    super(`Session not found: ${sessionId}`)
    this.name = 'SessionNotFoundError'
    Object.setPrototypeOf(this, SessionNotFoundError.prototype)
  }
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizeQuestion(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function buildRetrievalSystemPrompt(basePrompt: string | undefined, strategy: string): string {
  const rules = [
    '你是企业客服问答助手。',
    '你必须优先依据已提供的命中资料回答，不得脱离资料自行编造事实、参数、价格、流程或承诺。',
    '若资料已经给出结构化结果，优先保留该结构并做轻度润色，不要改写成散乱长文。',
    '若资料未直接命中，只能明确说明“当前资料未直接命中”，并提示可补充文档或转人工，不得自行脑补。',
    '若问题涉及价格，只能使用资料中已有价格；没有精确价格时要明确说明暂无精确匹配。',
    '回答保持简洁、专业、可执行，避免空泛套话。'
  ]

  if (strategy === 'knowledge') {
    rules.push('当前问题已命中知识条目或标准回复，优先沿用该口径。')
  } else if (strategy === 'price') {
    rules.push('当前问题是价格/报价问题，禁止输出资料之外的价格区间或估算。')
  } else {
    rules.push('当前问题使用文档检索结果回答，请优先引用资料摘要、产品参数和资料摘录。')
  }

  return [basePrompt?.trim() || '', rules.join('\n')].filter(Boolean).join('\n\n')
}

export async function processChatMessage(
  input: ProcessChatMessageInput,
  options: ProcessChatMessageOptions = {}
) {
  const storage = options.storage || getStorage()
  const tenant = await resolveTenant(input.tenantId, storage)

  if (!tenant) {
    throw new TenantNotFoundError(input.tenantId)
  }

  const now = Date.now()
  let sessionId = input.sessionId
  let history: Array<{ role: 'user' | 'assistant'; content: string }> = []
  const attachments = input.attachments?.map((item) => structuredClone(item)) ?? []

  if (sessionId) {
    const existingSession = await storage.getSessionById(sessionId)
    if (!existingSession || existingSession.tenantId !== tenant.id) {
      throw new SessionNotFoundError(sessionId)
    }

    const previousMessages = await storage.listMessagesBySession(sessionId)
    history = previousMessages.map((message) => ({
      role: message.role,
      content:
        message.attachments?.length
          ? `${message.content}\n[附件: ${message.attachments.map((item) => item.name).join('、')}]`
          : message.content
    }))

    await storage.saveSession({
      ...existingSession,
      lastMessageAt: now
    })
  } else {
    sessionId = nextId('session')
    await storage.saveSession({
      id: sessionId,
      tenantId: tenant.id,
      visitorId: 'anonymous',
      startedAt: now,
      lastMessageAt: now
    })
  }

  const normalizedQuestion = normalizeQuestion(input.message)

  if (tenant.reuseAnsweredQuestions !== false) {
    const tenantSessions = await storage.listSessionsByTenant(tenant.id)
    for (const session of tenantSessions) {
      const sessionMessages = await storage.listMessagesBySession(session.id)
      for (let index = 0; index < sessionMessages.length - 1; index += 1) {
        const current = sessionMessages[index]
        const next = sessionMessages[index + 1]

        if (
          current.role === 'user' &&
          next?.role === 'assistant' &&
          normalizeQuestion(current.content) === normalizedQuestion
        ) {
          await storage.saveMessage({
            id: nextId('message'),
            sessionId: sessionId,
            tenantId: tenant.id,
            role: 'user',
            content: input.message,
            createdAt: now,
            attachments
          })

          await storage.saveMessage({
            id: nextId('message'),
            sessionId: sessionId,
            tenantId: tenant.id,
            role: 'assistant',
            content: next.content,
            createdAt: Date.now(),
            matchedContentSources: next.matchedContentSources
          })

          return {
            reply: next.content,
            sessionId: sessionId,
            usage: {
              inputTokens: 0,
              outputTokens: 0,
              totalTokens: 0
            }
          }
        }
      }
    }
  }

  await storage.saveMessage({
    id: nextId('message'),
    sessionId: sessionId,
    tenantId: tenant.id,
    role: 'user',
    content: input.message,
    createdAt: now,
    attachments
  })

  const attachmentContext = attachments.length
    ? `用户本轮上传了附件：${attachments.map((item) => `${item.name}(${item.mimeType}, ${Math.max(1, Math.round(item.size / 1024))}KB)`).join('；')}`
    : ''
  const tenantContent = tenant.contentConfig
  const activeContentSources = tenantContent?.contentSources?.length ? tenantContent.contentSources : []
  const rawReplyContext = buildAssistantReply({
    query: input.message,
    knowledgeEntries: tenantContent?.knowledgeEntries?.length ? tenantContent.knowledgeEntries : assistantKnowledgeEntries,
    articles: tenantContent?.articles?.length ? tenantContent.articles : demoArticles,
    products: tenantContent?.products?.length ? tenantContent.products : demoProducts,
    consultingServices: tenantContent?.consultingServices?.length ? tenantContent.consultingServices : demoConsultingServices,
    contentSources: activeContentSources,
    siteConfig: {
      ...demoSiteConfig,
      brandName: tenant.brandName,
      phone: tenant.contactPhone || demoSiteConfig.phone,
      email: tenant.contactEmail || demoSiteConfig.email,
      address: tenant.contactAddress || demoSiteConfig.address
    },
    attachments,
    returnMeta: true
  }) as string | { content: string; meta?: { strategy?: string; matchedKnowledgeEntry?: { title: string } | null; matchedContentSources?: TenantContentSource[] } }

  const replyContext =
    typeof rawReplyContext === 'string'
      ? {
          content: rawReplyContext,
          meta: {
            strategy: 'document',
            matchedKnowledgeEntry: null,
            matchedContentSources: []
          }
        }
      : {
          content: rawReplyContext.content,
          meta: {
            strategy: rawReplyContext.meta?.strategy || 'document',
            matchedKnowledgeEntry: rawReplyContext.meta?.matchedKnowledgeEntry || null,
            matchedContentSources: rawReplyContext.meta?.matchedContentSources || []
          }
        }

  const matchedContentSources = [
    ...(replyContext.meta.matchedContentSources?.length
      ? toMatchedContentSourceReferences(replyContext.meta.matchedContentSources, input.message)
      : []),
    ...(replyContext.meta.matchedKnowledgeEntry
      ? [{ id: `knowledge:${replyContext.meta.matchedKnowledgeEntry.title}`, title: replyContext.meta.matchedKnowledgeEntry.title, type: 'document' as const, category: replyContext.meta.strategy === 'knowledge' ? '标准回复/知识库' : '知识命中' }]
      : [])
  ]

  const adapter = createLlmAdapter({
    endpoint: tenant.llmEndpoint || options.endpoint,
    apiKey: tenant.llmApiKey || options.apiKey,
    model: tenant.llmModel || options.model,
    systemPrompt: buildRetrievalSystemPrompt(tenant.systemPrompt, replyContext.meta.strategy),
    fetcher: options.fetcher,
    fallback: async () => replyContext.content
  })

  const reply = await adapter.reply({
    message: input.message,
    history,
    context: [replyContext.content, attachmentContext].filter(Boolean).join('\n\n')
  })

  await storage.saveMessage({
    id: nextId('message'),
    sessionId: sessionId,
    tenantId: tenant.id,
    role: 'assistant',
    content: reply.content,
    createdAt: Date.now(),
    matchedContentSources
  })

  await storage.saveUsageRecord({
    id: nextId('usage'),
    tenantId: tenant.id,
    sessionId: sessionId,
    provider: 'openai-compatible',
    model: reply.model,
    inputTokens: reply.inputTokens,
    outputTokens: reply.outputTokens,
    totalTokens: reply.totalTokens,
    amount: '0',
    status: reply.status === 'success' ? 'success' : 'unknown',
    createdAt: Date.now()
  })

  return {
    reply: reply.content,
    sessionId: sessionId,
    usage: {
      inputTokens: reply.inputTokens,
      outputTokens: reply.outputTokens,
      totalTokens: reply.totalTokens
    }
  }
}
