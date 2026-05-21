import { buildDocumentAnswer, buildPriceAnswer, pickKnowledgeEntry } from '../../../lib/customer-bot.ts'
import type {
  ArticleListItem,
  AssistantKnowledgeEntry,
  AnswerSource,
  ConsultingServiceListItem,
  ProductListItem,
  SiteConfig,
  TenantContentSource
} from '../../../types'
import type { QueryRoute } from './query-classifier'

export interface StructuredFastPathResult {
  handled: boolean
  answerSource?: AnswerSource
  content?: string
  route: QueryRoute
}

export function runStructuredFastPath(input: {
  route: QueryRoute
  query: string
  knowledgeEntries: AssistantKnowledgeEntry[]
  articles: ArticleListItem[]
  products: ProductListItem[]
  consultingServices: ConsultingServiceListItem[]
  contentSources: TenantContentSource[]
  siteConfig: SiteConfig
  allowGenericFaq?: boolean
}): StructuredFastPathResult {
  if (input.route === 'price') {
    return {
      handled: true,
      answerSource: 'structured',
      content: buildPriceAnswer({
        query: input.query,
        products: input.products,
        consultingServices: input.consultingServices
      }),
      route: input.route
    }
  }

  if (input.route === 'contact') {
    return {
      handled: true,
      answerSource: 'structured',
      content: [
        '可通过以下方式继续沟通：',
        `- 电话：${input.siteConfig.phone}`,
        `- 邮箱：${input.siteConfig.email}`,
        `- 地址：${input.siteConfig.address}`
      ].join('\n'),
      route: input.route
    }
  }

  const matchedKnowledgeEntry = input.route === 'faq' ? pickKnowledgeEntry(input.query, input.knowledgeEntries) : null
  if (input.route === 'faq' && (matchedKnowledgeEntry || input.allowGenericFaq)) {
    return {
      handled: true,
      answerSource: 'structured',
      content: buildDocumentAnswer({
        query: input.query,
        knowledgeEntries: input.knowledgeEntries,
        articles: input.articles,
        products: input.products,
        consultingServices: input.consultingServices,
        contentSources: input.contentSources,
        siteConfig: input.siteConfig
      }) as string,
      route: input.route
    }
  }

  return {
    handled: false,
    route: input.route
  }
}
