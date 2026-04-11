import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { applyTenantRagPreset } from '../../../packages/shared-config/src/rag-settings.ts'
import type {
  ArticleListItem,
  AssistantKnowledgeEntry,
  TenantContentConfig,
  TenantContentSource,
  TenantRecord,
  ProductListItem
} from '../../../types'

interface FastenerIndustryPack {
  knowledgeEntries: AssistantKnowledgeEntry[]
  products: ProductListItem[]
  articles: ArticleListItem[]
  contentSources: TenantContentSource[]
}

function packPath(...parts: string[]): string {
  return resolve(process.cwd(), 'demo', 'industry-packs', 'fastener', ...parts)
}

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T
}

function buildDocumentContentSource(input: {
  id: string
  title: string
  category: string
  content: string
  sourceLabel: string
}): TenantContentSource {
  const summary = input.content
    .split(/\r?\n/)
    .map((item) => item.trim())
    .find((item) => item && !item.startsWith('#')) || `${input.title} 行业资料`

  return {
    id: input.id,
    type: 'document',
    enabled: true,
    category: input.category,
    title: input.title,
    sourceUrl: '',
    sourceLabel: input.sourceLabel,
    summary,
    content: input.content.trim(),
    tags: [input.category, '紧固件'].filter(Boolean),
    faqQuestions: [],
    answerHints: [],
    updatedAt: Date.now()
  }
}

export async function loadFastenerIndustryPack(): Promise<FastenerIndustryPack> {
  const [knowledgeEntries, products, articles, standardsDoc, materialDoc, surfaceDoc, orderingDoc] = await Promise.all([
    readJson<AssistantKnowledgeEntry[]>(packPath('knowledge-entries.json')),
    readJson<ProductListItem[]>(packPath('products.json')),
    readJson<ArticleListItem[]>(packPath('articles.json')),
    readFile(packPath('rag-docs', '01-standards-and-product-family.md'), 'utf8'),
    readFile(packPath('rag-docs', '02-material-and-strength.md'), 'utf8'),
    readFile(packPath('rag-docs', '03-surface-treatment-and-application.md'), 'utf8'),
    readFile(packPath('rag-docs', '04-ordering-packaging-customization.md'), 'utf8')
  ])

  return {
    knowledgeEntries,
    products,
    articles,
    contentSources: [
      buildDocumentContentSource({
        id: 'fastener-source-standards',
        title: '紧固件标准体系与常用品类',
        category: '标准',
        content: standardsDoc,
        sourceLabel: '01-standards-and-product-family.md'
      }),
      buildDocumentContentSource({
        id: 'fastener-source-materials',
        title: '紧固件材质与强度等级说明',
        category: '材质与等级',
        content: materialDoc,
        sourceLabel: '02-material-and-strength.md'
      }),
      buildDocumentContentSource({
        id: 'fastener-source-surface',
        title: '表面处理与应用场景',
        category: '表面处理',
        content: surfaceDoc,
        sourceLabel: '03-surface-treatment-and-application.md'
      }),
      buildDocumentContentSource({
        id: 'fastener-source-ordering',
        title: '交期、包装与非标定制',
        category: '交期与定制',
        content: orderingDoc,
        sourceLabel: '04-ordering-packaging-customization.md'
      })
    ]
  }
}

export async function buildFastenerTenantContentUpdate(existing: TenantRecord): Promise<TenantRecord> {
  const pack = await loadFastenerIndustryPack()

  const nextContentConfig: TenantContentConfig = {
    knowledgeEntries: pack.knowledgeEntries,
    articles: pack.articles,
    products: pack.products,
    consultingServices: [],
    contentSources: pack.contentSources
  }

  return {
    ...existing,
    ragSettings: applyTenantRagPreset('fastener', existing.ragSettings),
    contentConfig: nextContentConfig,
    updatedAt: Date.now()
  }
}
