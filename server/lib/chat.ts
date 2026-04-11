import { assistantKnowledgeEntries } from '../../config/ai-assistant-knowledge.ts'
import { demoArticles, demoConsultingServices, demoProducts, demoSiteConfig } from '../../config/customer-bot-data.ts'
import { pickKnowledgeEntry } from '../../lib/customer-bot.ts'
import type {
  CitationRecord,
  CredentialSource,
  MatchedContentSource,
  MessageAttachment,
  RetrievalConfidence,
  TenantContentSource
} from '../../types'
import { createLlmAdapter } from '../../src/llm-adapter.ts'
import { generateFallbackAnswer } from './rag/fallback-chain.ts'
import { generateGroundedAnswer } from './rag/answer-chain.ts'
import { buildCitationContext } from './rag/build-context.ts'
import { classifyQuery } from './rag/query-classifier.ts'
import { renderRagTemplate } from './rag/render-template.ts'
import { retrieveForTenant } from './rag/retriever.ts'
import { runStructuredFastPath } from './rag/structured-fast-path.ts'
import type { RagRepository } from './repositories/rag-repository'
import type { StorageRepository } from './storage/types'
import { getRagRepository, getStorage } from './storage/index.ts'
import { TenantNotFoundError } from './tenants.ts'
import { resolveTenant } from './tenant-resolver.ts'
import { normalizeTenantRagSettings, type TenantRagSettings } from '../../packages/shared-config/src/rag-settings.ts'

export interface ProcessChatMessageInput {
  tenantId: string
  message: string
  sessionId?: string
  attachments?: MessageAttachment[]
}

export interface ProcessChatMessageOptions {
  storage?: StorageRepository
  ragRepository?: RagRepository
  endpoint?: string
  apiKey?: string
  model?: string
  platformEndpoint?: string
  platformApiKey?: string
  platformModel?: string
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

function buildRetrievalSystemPrompt(input: {
  basePrompt: string | undefined
  strategy: string
  query: string
  brandName: string
  ragSettings: TenantRagSettings
}): string {
  const rules = [
    '你是企业客服问答助手。',
    '你必须优先依据已提供的命中资料回答，不得脱离资料自行编造事实、参数、价格、流程或承诺。',
    '若资料已经给出结构化结果，优先保留该结构并做轻度润色，不要改写成散乱长文。',
    '若资料未直接命中，只能明确说明“当前资料未直接命中”，并提示可补充文档或转人工，不得自行脑补。',
    '若问题涉及价格，只能使用资料中已有价格；没有精确价格时要明确说明暂无精确匹配。',
    '回答保持简洁、专业、可执行，避免空泛套话。'
  ]

  if (input.strategy === 'knowledge') {
    rules.push('当前问题已命中知识条目或标准回复，优先沿用该口径。')
  } else if (input.strategy === 'price') {
    rules.push('当前问题是价格/报价问题，禁止输出资料之外的价格区间或估算。')
  } else {
    rules.push('当前问题使用文档检索结果回答，请优先引用资料摘要、产品参数和资料摘录。')
  }

  const templatePrompt = renderRagTemplate(input.ragSettings.retrievalPromptTemplate, {
    query: input.query,
    brandName: input.brandName,
    answerStructureTemplate: input.ragSettings.answerStructureTemplate
  })

  return [input.basePrompt?.trim() || '', rules.join('\n'), templatePrompt].filter(Boolean).join('\n\n')
}

function buildFallbackSystemPrompt(input: {
  basePrompt: string | undefined
  query: string
  brandName: string
  ragSettings: TenantRagSettings
}): string {
  const templatePrompt = renderRagTemplate(input.ragSettings.fallbackPromptTemplate, {
    query: input.query,
    brandName: input.brandName,
    answerStructureTemplate: input.ragSettings.answerStructureTemplate
  })

  return [
    input.basePrompt?.trim() || '',
    '当前租户资料未直接命中。仅允许给出通用参考，不得编造价格、参数、交付承诺或事实。',
    templatePrompt
  ]
    .filter(Boolean)
    .join('\n\n')
}

function buildAnswerStructureContext(answerStructureTemplate: string | undefined): string {
  const template = answerStructureTemplate?.trim()
  if (!template) {
    return ''
  }

  return ['【回答结构模板】', template].join('\n')
}

function toMatchedContentSourcesFromCitations(citations: CitationRecord[]): MatchedContentSource[] {
  return citations.map((citation) => ({
    id: citation.chunkId,
    title: citation.title,
    type: 'document',
    category: 'RAG 命中',
    snippet: citation.snippet
  }))
}

function buildTenantSiteConfig(tenant: Awaited<ReturnType<typeof resolveTenant>>) {
  return {
    ...demoSiteConfig,
    brandName: tenant?.brandName || demoSiteConfig.brandName,
    phone: tenant?.contactPhone || demoSiteConfig.phone,
    email: tenant?.contactEmail || demoSiteConfig.email,
    address: tenant?.contactAddress || demoSiteConfig.address
  }
}

function buildAttachmentNotice(attachments: MessageAttachment[]): string {
  if (!attachments.length) {
    return ''
  }

  const lines = ['【已收到附件】']
  attachments.forEach((attachment) => {
    lines.push(`- ${attachment.name}（${Math.max(1, Math.round(attachment.size / 1024))} KB）`)
  })
  lines.push('当前链路已记录附件；如需基于附件内容做更深入识别，可继续补充视觉或文件解析能力。')
  return lines.join('\n')
}

export async function processChatMessage(
  input: ProcessChatMessageInput,
  options: ProcessChatMessageOptions = {}
) {
  const storage = options.storage || getStorage()
  const ragRepository = options.ragRepository || getRagRepository()
  const tenant = await resolveTenant(input.tenantId, storage)

  if (!tenant) {
    throw new TenantNotFoundError(input.tenantId)
  }

  const ragSettings = normalizeTenantRagSettings(tenant.ragSettings)

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
            matchedContentSources: next.matchedContentSources,
            citations: next.citations,
            answerSource: next.answerSource,
            credentialSource: next.credentialSource,
            retrievalConfidence: next.retrievalConfidence
          })

          return {
            reply: next.content,
            sessionId: sessionId,
            answerSource: next.answerSource || 'structured',
            credentialSource: next.credentialSource || 'tenant',
            citations: next.citations || [],
            retrievalConfidence: next.retrievalConfidence || 'miss',
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
  const knowledgeEntries = tenantContent?.knowledgeEntries?.length ? tenantContent.knowledgeEntries : assistantKnowledgeEntries
  const articles = tenantContent?.articles?.length ? tenantContent.articles : demoArticles
  const products = tenantContent?.products?.length ? tenantContent.products : demoProducts
  const consultingServices = tenantContent?.consultingServices?.length ? tenantContent.consultingServices : demoConsultingServices
  const siteConfig = buildTenantSiteConfig(tenant)
  const route = classifyQuery(input.message)
  const structuredReply = runStructuredFastPath({
    route,
    query: input.message,
    knowledgeEntries,
    articles,
    products,
    consultingServices,
    contentSources: activeContentSources,
    siteConfig
  })

  let replyContent = ''
  let matchedContentSources: MatchedContentSource[] = []
  let citations: CitationRecord[] = []
  let answerSource: 'structured' | 'rag' | 'general_fallback' = 'structured'
  let credentialSource: CredentialSource = 'tenant'
  let retrievalConfidence: RetrievalConfidence = 'miss'
  let usage = {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0
  }
  let usageModel = ''
  let usageStatus: 'success' | 'failed' | 'unknown' = 'unknown'

  if (structuredReply.handled) {
    replyContent = structuredReply.content || '当前已按结构化路径处理。'
    retrievalConfidence = 'high'

    if (route === 'faq') {
      const matchedKnowledge = pickKnowledgeEntry(input.message, knowledgeEntries)
      if (matchedKnowledge) {
        matchedContentSources = [
          {
            id: `knowledge:${matchedKnowledge.id}`,
            title: matchedKnowledge.title,
            type: 'document',
            category: '标准回复/知识库'
          }
        ]
      }
    }
  } else {
    if (ragSettings.enabled) {
      const retrieval = await retrieveForTenant({
        tenantId: tenant.id,
        query: input.message,
        repository: ragRepository,
        topK: ragSettings.retrievalTopK
      })

      retrievalConfidence = retrieval.confidence
      citations = retrieval.citations
      matchedContentSources = toMatchedContentSourcesFromCitations(citations)

      if (retrieval.confidence !== 'miss') {
        answerSource = 'rag'
        const answerTemplateContext = buildAnswerStructureContext(ragSettings.answerStructureTemplate)
        const adapter = createLlmAdapter({
          endpoint: tenant.llmEndpoint || options.endpoint,
          apiKey: tenant.llmApiKey || options.apiKey,
          model: tenant.llmModel || options.model,
          systemPrompt: buildRetrievalSystemPrompt({
            basePrompt: tenant.systemPrompt,
            strategy: 'document',
            query: input.message,
            brandName: tenant.brandName,
            ragSettings
          }),
          fetcher: options.fetcher,
          fallback: async () =>
            generateGroundedAnswer({
              query: input.message,
              citations,
              instructions: ragSettings.answerStructureTemplate
            })
        })

        const reply = await adapter.reply({
          message: input.message,
          history,
          context: [
            answerTemplateContext,
            buildCitationContext({ query: input.message, citations }),
            attachmentContext
          ]
            .filter(Boolean)
            .join('\n\n')
        })

        replyContent = reply.content
        usage = {
          inputTokens: reply.inputTokens,
          outputTokens: reply.outputTokens,
          totalTokens: reply.totalTokens
        }
        usageModel = reply.model
        usageStatus = reply.status === 'success' ? 'success' : 'unknown'
      }
    }

    if (!replyContent) {
      answerSource = 'general_fallback'
      credentialSource = 'platform_shared'
      retrievalConfidence = ragSettings.enabled ? retrievalConfidence : 'miss'
      const sharedEndpoint = options.platformEndpoint || process.env.CUSTOMER_BOT_PLATFORM_LLM_ENDPOINT?.trim() || ''
      const sharedApiKey = options.platformApiKey || process.env.CUSTOMER_BOT_PLATFORM_LLM_API_KEY?.trim() || ''
      const sharedModel = options.platformModel || process.env.CUSTOMER_BOT_PLATFORM_LLM_MODEL?.trim() || ''

      const adapter = createLlmAdapter({
        endpoint: sharedEndpoint,
        apiKey: sharedApiKey,
        model: sharedModel,
        systemPrompt: buildFallbackSystemPrompt({
          basePrompt: tenant.systemPrompt,
          query: input.message,
          brandName: tenant.brandName,
          ragSettings
        }),
        fetcher: options.fetcher,
        fallback: async () =>
          generateFallbackAnswer({
            query: input.message,
            brandName: tenant.brandName,
            instructions: ragSettings.answerStructureTemplate
          })
      })

      const reply = await adapter.reply({
        message: input.message,
        history,
        context: [buildAnswerStructureContext(ragSettings.answerStructureTemplate), attachmentContext]
          .filter(Boolean)
          .join('\n\n')
      })

      replyContent = reply.content
      usage = {
        inputTokens: reply.inputTokens,
        outputTokens: reply.outputTokens,
        totalTokens: reply.totalTokens
      }
      usageModel = reply.model
      usageStatus = reply.status === 'success' ? 'success' : 'unknown'
    }
  }

  const attachmentNotice = buildAttachmentNotice(attachments)
  if (attachmentNotice) {
    replyContent = [replyContent, attachmentNotice].filter(Boolean).join('\n\n')
  }

  await storage.saveMessage({
    id: nextId('message'),
    sessionId: sessionId,
    tenantId: tenant.id,
    role: 'assistant',
    content: replyContent,
    createdAt: Date.now(),
    matchedContentSources,
    citations,
    answerSource,
    credentialSource,
    retrievalConfidence
  })

  if (usage.totalTokens > 0 || answerSource === 'general_fallback') {
    await storage.saveUsageRecord({
      id: nextId('usage'),
      tenantId: tenant.id,
      sessionId: sessionId,
      provider: answerSource === 'general_fallback' ? 'platform-shared-llm' : 'openai-compatible',
      model: usageModel,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      totalTokens: usage.totalTokens,
      amount: '0',
      status: usageStatus,
      credentialSource,
      answerSource,
      createdAt: Date.now()
    })
  }

  return {
    reply: replyContent,
    sessionId: sessionId,
    answerSource,
    credentialSource,
    citations,
    retrievalConfidence,
    usage
  }
}
