import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { buildDocumentAnswer, buildPriceAnswer, pickKnowledgeEntry } from '../lib/customer-bot.ts'
import { demoSiteConfig } from '../config/customer-bot-data.ts'
import type { ArticleListItem, AssistantKnowledgeEntry, ProductListItem } from '../types'

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T
}

async function main() {
  const knowledgeEntries = await readJson<AssistantKnowledgeEntry[]>('demo/industry-packs/fastener/knowledge-entries.json')
  const products = await readJson<ProductListItem[]>('demo/industry-packs/fastener/products.json')
  const articles = await readJson<ArticleListItem[]>('demo/industry-packs/fastener/articles.json')
  const testCases = await readFile('demo/industry-packs/fastener/test-cases.md', 'utf8')

  assert.equal(knowledgeEntries.length >= 6, true)
  assert.equal(products.length >= 6, true)
  assert.equal(articles.length >= 5, true)
  assert.equal(testCases.includes('8.8级和10.9级螺栓怎么选？'), true)
  assert.equal(testCases.includes('DIN 933 六角螺栓和 GB 5783 有什么区别？'), true)

  const matchedMaterial = pickKnowledgeEntry('304 和 316 不锈钢有什么区别？', knowledgeEntries)
  assert.equal(matchedMaterial?.id, 'fastener-knowledge-materials')

  const documentAnswer = buildDocumentAnswer({
    query: '8.8级和10.9级螺栓怎么选？',
    knowledgeEntries,
    articles,
    products,
    consultingServices: [],
    contentSources: [],
    siteConfig: demoSiteConfig
  })
  assert.equal(documentAnswer.includes('强度等级'), true)
  assert.equal(documentAnswer.includes('【参考资料】'), true)

  const priceAnswer = buildPriceAnswer({
    query: 'DIN 933 六角头螺栓 M8x30 多少钱？',
    products,
    consultingServices: []
  })
  assert.equal(priceAnswer.includes('DIN 933 六角头螺栓 M8x30'), true)
  assert.equal(priceAnswer.includes('¥'), true)

  console.log('fastener training pack verified')
}

void main()
