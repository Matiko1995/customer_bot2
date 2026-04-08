import type {
  ArticleListItem,
  AssistantKnowledgeEntry,
  ConsultingServiceListItem,
  MatchedContentSource,
  MessageAttachment,
  ProductListItem,
  SiteConfig,
  TenantContentSource,
  TenantContentSourceType
} from '../types'

export interface AssistantReplyMeta {
  strategy: 'knowledge' | 'price' | 'document'
  matchedKnowledgeEntry?: AssistantKnowledgeEntry | null
  matchedContentSources?: TenantContentSource[]
}

function normalizeText(value: string): string {
  return Array.from(value.toLowerCase())
    .filter((char) => /[a-z0-9\u4e00-\u9fa5]/.test(char))
    .join('')
}

function extractKeywords(value: string): string[] {
  const words = value
    .toLowerCase()
    .split(/[^a-z0-9\u4e00-\u9fa5]+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 2)

  const chineseSegments = value.match(/[\u4e00-\u9fa5]{2,}/g) ?? []
  const chineseTokens: string[] = []

  for (const segment of chineseSegments) {
    if (segment.length <= 4) {
      chineseTokens.push(segment)
      continue
    }

    for (let index = 0; index < segment.length - 1; index += 1) {
      chineseTokens.push(segment.slice(index, index + 2))
    }
  }

  return Array.from(new Set([...words, ...chineseTokens])).filter((word) => word.length >= 2)
}

function scoreSource(source: string, query: string, keywords: string[]): number {
  const normalizedSource = normalizeText(source)
  if (!normalizedSource) {
    return 0
  }

  let score = 0
  const normalizedQuery = normalizeText(query)

  if (normalizedQuery && normalizedSource.includes(normalizedQuery)) {
    score += 10
  }

  for (const keyword of keywords) {
    const normalizedKeyword = normalizeText(keyword)
    if (normalizedKeyword && normalizedSource.includes(normalizedKeyword)) {
      score += 2
    }
  }

  return score
}

function rankByQuery<T>(items: T[], query: string, resolveText: (item: T) => string): T[] {
  const keywords = extractKeywords(query)

  return [...items]
    .map((item) => ({
      item,
      score: scoreSource(resolveText(item), query, keywords)
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .map((item) => item.item)
}

function formatContentSourceType(type: TenantContentSourceType): string {
  if (type === 'webpage') return '网页'
  if (type === 'email') return '邮件'
  if (type === 'excel') return '表格'
  return '文档'
}

function buildContentSourceCorpus(item: TenantContentSource): string {
  return [
    item.title,
    item.category,
    item.summary,
    item.content,
    item.sourceLabel,
    item.sourceUrl,
    ...(item.tags ?? []),
    ...(item.faqQuestions ?? []),
    ...(item.answerHints ?? [])
  ]
    .filter(Boolean)
    .join(' ')
}

function getEnabledContentSources(items: TenantContentSource[]): TenantContentSource[] {
  return items.filter((item) => item.enabled !== false)
}

function splitContentIntoSegments(content: string): string[] {
  const compact = content.replace(/\r/g, '\n').trim()
  if (!compact) {
    return []
  }

  const paragraphSegments = compact
    .split(/\n{2,}/)
    .map((segment) => segment.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  const rawSegments = paragraphSegments.length ? paragraphSegments : compact.split(/[。！？!?；;\n]+/).map((segment) => segment.replace(/\s+/g, ' ').trim())
  const limitedSegments: string[] = []

  for (const segment of rawSegments.filter(Boolean)) {
    if (segment.length <= 140) {
      limitedSegments.push(segment)
      continue
    }

    for (let index = 0; index < segment.length; index += 120) {
      const slice = segment.slice(index, index + 120).trim()
      if (slice) {
        limitedSegments.push(slice)
      }
    }
  }

  return limitedSegments.slice(0, 24)
}

function pickBestContentSegment(item: TenantContentSource, query: string): string {
  const segments = splitContentIntoSegments(item.content)
  if (!segments.length) {
    return item.summary.trim()
  }

  const keywords = extractKeywords(query)
  const rankedSegments = segments
    .map((segment) => ({
      segment,
      score: scoreSource(segment, query, keywords)
    }))
    .sort((left, right) => right.score - left.score)

  return rankedSegments[0]?.score ? rankedSegments[0].segment : segments[0]
}

export function pickMatchedContentSources(query: string, contentSources: TenantContentSource[]): TenantContentSource[] {
  const keywords = extractKeywords(query)

  return [...getEnabledContentSources(contentSources)]
    .map((item) => {
      const corpusScore = scoreSource(buildContentSourceCorpus(item), query, keywords)
      const segmentScore = splitContentIntoSegments(item.content).reduce((max, segment) => Math.max(max, scoreSource(segment, query, keywords)), 0)
      const faqScore = (item.faqQuestions ?? []).reduce((sum, question) => sum + scoreSource(question, query, keywords) * 2, 0)
      const hintScore = (item.answerHints ?? []).reduce((sum, hint) => sum + scoreSource(hint, query, keywords), 0)
      return {
        item,
        score: corpusScore + segmentScore * 2 + faqScore + hintScore
      }
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map((item) => item.item)
}

export function toMatchedContentSourceReferences(items: TenantContentSource[], query: string): MatchedContentSource[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    type: item.type,
    category: item.category,
    snippet: pickContentSourceSnippet(item, query),
    answerHints: item.answerHints?.slice(0, 4) ?? []
  }))
}

function pickContentSourceSnippet(item: TenantContentSource, query: string): string {
  const compact = pickBestContentSegment(item, query).replace(/\s+/g, ' ').trim()
  if (!compact) {
    return item.summary.trim()
  }

  const keywords = [query, ...extractKeywords(query)].map((value) => value.trim()).filter(Boolean)
  const matchedKeyword = keywords.find((keyword) => compact.toLowerCase().includes(keyword.toLowerCase()))
  if (!matchedKeyword) {
    return compact.slice(0, 120)
  }

  const index = compact.toLowerCase().indexOf(matchedKeyword.toLowerCase())
  const start = Math.max(0, index - 24)
  const end = Math.min(compact.length, index + matchedKeyword.length + 48)
  return compact.slice(start, end)
}

function scoreKnowledgeEntry(entry: AssistantKnowledgeEntry, query: string): number {
  const keywords = extractKeywords(query)
  const normalizedQuery = normalizeText(query)
  const corpus = [entry.title, entry.oneLiner, entry.whatIs, ...entry.problems, ...entry.workflow, ...entry.scenarios, ...entry.outcomes].join(
    ' '
  )

  let score = scoreSource(corpus, query, keywords)

  for (const keyword of entry.keywords) {
    const normalizedKeyword = normalizeText(keyword)
    if (normalizedKeyword && normalizedQuery.includes(normalizedKeyword)) {
      score += 8
    }
  }

  return score
}

function hasDirectKeywordHit(entry: AssistantKnowledgeEntry, query: string): boolean {
  const normalizedQuery = normalizeText(query)
  if (!normalizedQuery) {
    return false
  }

  return entry.keywords.some((keyword) => {
    const normalizedKeyword = normalizeText(keyword)
    return normalizedKeyword.length >= 2 && normalizedQuery.includes(normalizedKeyword)
  })
}

export function pickKnowledgeEntry(query: string, knowledgeEntries: AssistantKnowledgeEntry[]): AssistantKnowledgeEntry | null {
  const ranked = knowledgeEntries
    .map((entry) => {
      const baseScore = scoreKnowledgeEntry(entry, query)
      const priorityBoost = entry.source === 'faq-standard-reply' && hasDirectKeywordHit(entry, query) ? 24 : 0
      return { entry, score: baseScore + priorityBoost }
    })
    .sort((left, right) => right.score - left.score)

  const top = ranked[0]
  if (!top || top.score < 8) {
    return null
  }

  return top.entry
}

function buildKnowledgeAnswer(entry: AssistantKnowledgeEntry, question: string): string {
  const lines: string[] = [
    '基于当前资料，结构化答复如下：',
    `【你的问题】${question}`,
    `【主题】${entry.title}`,
    `【一句话】${entry.oneLiner}`,
    `【它是什么】${entry.whatIs}`,
    '【主要解决】'
  ]

  entry.problems.forEach((item) => {
    lines.push(`- ${item}`)
  })

  lines.push('【落地流程】')
  entry.workflow.forEach((item, index) => {
    lines.push(`${index + 1}. ${item}`)
  })

  lines.push('【适用场景】')
  entry.scenarios.forEach((item) => {
    lines.push(`- ${item}`)
  })

  lines.push('【预期效果】')
  entry.outcomes.forEach((item) => {
    lines.push(`- ${item}`)
  })

  lines.push('【参考资料】')
  lines.push(`- 知识条目：${entry.title}`)
  lines.push(`- 来源：${entry.source}`)

  return lines.join('\n')
}

function formatConsultingPrice(item: ConsultingServiceListItem): string {
  if (item.negotiable) {
    return '面议'
  }

  if (!item.price.trim()) {
    return '面议'
  }

  if (item.price.startsWith('¥') || item.price.startsWith('￥')) {
    return item.price
  }

  return `¥${item.price}`
}

export function buildPriceAnswer(input: {
  query: string
  products: ProductListItem[]
  consultingServices: ConsultingServiceListItem[]
}): string {
  const { query, products, consultingServices } = input
  const matchedProducts = rankByQuery(products, query, (item) => `${item.name} ${item.category} ${item.summary}`).slice(0, 8)
  const matchedConsulting = rankByQuery(
    consultingServices,
    query,
    (item) => `${item.name} ${item.category} ${item.introduction}`
  ).slice(0, 5)

  if (matchedProducts.length === 0 && matchedConsulting.length === 0) {
    const examples = products
      .slice(0, 3)
      .map((item) => item.name)
      .join('、')

    return `暂无精确匹配。你可以试试这些示例：${examples || '六角头螺栓、高速螺丝机'}。`
  }

  const lines = ['已检索到以下价格信息：']
  matchedProducts.forEach((item) => {
    lines.push(`- [${item.category}] ${item.name}：${item.priceText}`)
    if (item.parameters?.length) {
      lines.push(`  参数：${item.parameters.map((parameter) => `${parameter.label}=${parameter.value}`).join('；')}`)
    }
  })
  matchedConsulting.forEach((item) => {
    lines.push(`- [咨询] ${item.name}：${formatConsultingPrice(item)}`)
  })
  lines.push('【参考资料】')
  matchedProducts.forEach((item) => {
    lines.push(`- 产品：${item.name}`)
  })
  matchedConsulting.forEach((item) => {
    lines.push(`- 咨询服务：${item.name}`)
  })
  lines.push('如需正式报价，请提交联系需求。')

  return lines.join('\n')
}

export function buildDocumentAnswer(input: {
  query: string
  knowledgeEntries: AssistantKnowledgeEntry[]
  articles: ArticleListItem[]
  products: ProductListItem[]
  consultingServices: ConsultingServiceListItem[]
  contentSources: TenantContentSource[]
  siteConfig: SiteConfig
  returnMeta?: boolean
}): string | { content: string; meta: AssistantReplyMeta } {
  const { query, knowledgeEntries, articles, products, consultingServices, contentSources, siteConfig } = input
  const question = query.trim() || '请介绍你们的平台能力'
  const matchedKnowledge = pickKnowledgeEntry(question, knowledgeEntries)

  if (matchedKnowledge) {
    const content = buildKnowledgeAnswer(matchedKnowledge, question)
    return input.returnMeta ? { content, meta: { strategy: 'knowledge', matchedKnowledgeEntry: matchedKnowledge, matchedContentSources: [] } } : content
  }

  const matchedArticles = rankByQuery(articles, question, (item) => `${item.title} ${item.summary} ${item.category}`).slice(0, 3)
  const matchedProducts = rankByQuery(products, question, (item) => `${item.name} ${item.category} ${item.summary}`).slice(0, 3)
  const matchedConsulting = rankByQuery(
    consultingServices,
    question,
    (item) => `${item.name} ${item.category} ${item.introduction}`
  ).slice(0, 2)
  const matchedSources = pickMatchedContentSources(question, contentSources)

  const lines = [
    '基于当前资料，结构化答复如下：',
    `【你的问题】${question}`,
    `【平台定位】${siteConfig.heroTitle}`,
    `【服务简介】${siteConfig.about}`
  ]

  if (matchedArticles.length === 0 && matchedProducts.length === 0 && matchedConsulting.length === 0 && matchedSources.length === 0) {
    lines.push('【说明】当前资料没有直接命中该问题。可以补充知识条目后再回答。')
    const content = lines.join('\n')
    return input.returnMeta ? { content, meta: { strategy: 'document', matchedKnowledgeEntry: null, matchedContentSources: [] } } : content
  }

  if (matchedArticles.length > 0) {
    lines.push('【相关文档摘要】')
    matchedArticles.forEach((item) => {
      lines.push(`- ${item.title}：${item.summary}`)
    })
  }

  if (matchedProducts.length > 0) {
    lines.push('【相关产品线索】')
    matchedProducts.forEach((item) => {
      lines.push(`- ${item.name}（${item.category}）：${item.summary}`)
      if (item.parameters?.length) {
        lines.push(`  参数：${item.parameters.map((parameter) => `${parameter.label}=${parameter.value}`).join('；')}`)
      }
    })
  }

  if (matchedConsulting.length > 0) {
    lines.push('【相关咨询线索】')
    matchedConsulting.forEach((item) => {
      lines.push(`- ${item.name}：${item.introduction}`)
    })
  }

  if (matchedSources.length > 0) {
    lines.push('【相关资料源】')
    matchedSources.forEach((item) => {
      lines.push(`- [${formatContentSourceType(item.type)}] ${item.title}：${item.summary}`)
      if (item.category?.trim()) {
        lines.push(`  分类：${item.category.trim()}`)
      }
      if (item.answerHints?.length) {
        lines.push(`  回答要点：${item.answerHints.join('；')}`)
      }
      const snippet = pickContentSourceSnippet(item, question)
      if (snippet) {
        lines.push(`  摘录：${snippet}`)
      }
    })
  }

  lines.push('【参考资料】')
  matchedArticles.forEach((item) => {
    lines.push(`- 文档：${item.title}`)
  })
  matchedProducts.forEach((item) => {
    lines.push(`- 产品：${item.name}`)
  })
  matchedConsulting.forEach((item) => {
    lines.push(`- 咨询服务：${item.name}`)
  })
  matchedSources.forEach((item) => {
    const sourceRef = item.sourceUrl || item.sourceLabel || item.id
    lines.push(`- ${formatContentSourceType(item.type)}：${item.title} (${sourceRef})`)
  })

  const content = lines.join('\n')
  return input.returnMeta ? { content, meta: { strategy: 'document', matchedKnowledgeEntry: null, matchedContentSources: matchedSources } } : content
}

function looksLikePriceQuestion(query: string): boolean {
  return /价格|报价|多少钱|费用|预算|采购价|单价/.test(query)
}

function buildAttachmentNotice(attachments: MessageAttachment[] | undefined): string {
  if (!attachments?.length) {
    return ''
  }

  const lines = ['【已收到附件】']
  attachments.forEach((attachment) => {
    lines.push(`- ${attachment.name}（${Math.max(1, Math.round(attachment.size / 1024))} KB）`)
  })
  lines.push('当前 MVP 已支持截图随会话留存；若需图像识别结论，请由客服进一步处理或接入视觉模型。')
  return lines.join('\n')
}

export function buildAssistantReply(input: {
  query: string
  knowledgeEntries: AssistantKnowledgeEntry[]
  articles: ArticleListItem[]
  products: ProductListItem[]
  consultingServices: ConsultingServiceListItem[]
  contentSources: TenantContentSource[]
  siteConfig: SiteConfig
  attachments?: MessageAttachment[]
  returnMeta?: boolean
}): string | { content: string; meta: AssistantReplyMeta } {
  let baseAnswer: string
  let meta: AssistantReplyMeta

  if (looksLikePriceQuestion(input.query)) {
    baseAnswer = buildPriceAnswer({
      query: input.query,
      products: input.products,
      consultingServices: input.consultingServices
    })
    meta = { strategy: 'price', matchedKnowledgeEntry: null, matchedContentSources: [] }
  } else {
    const documentResult = buildDocumentAnswer({ ...input, returnMeta: true }) as { content: string; meta: AssistantReplyMeta }
    baseAnswer = documentResult.content
    meta = documentResult.meta
  }

  const attachmentNotice = buildAttachmentNotice(input.attachments)
  const content = [baseAnswer, attachmentNotice].filter(Boolean).join('\n\n')
  return input.returnMeta ? { content, meta } : content
}
