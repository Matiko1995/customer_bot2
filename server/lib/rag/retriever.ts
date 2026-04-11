import type { CitationRecord, DocumentChunkRecord, RetrievalConfidence } from '../../../types'
import type { RagRepository } from '../repositories/rag-repository.ts'

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

function extractTokens(value: string): string[] {
  return Array.from(
    new Set(
      normalize(value)
        .split(/[^a-z0-9\u4e00-\u9fa5]+/)
        .map((item) => item.trim())
        .filter((item) => item.length >= 2)
    )
  )
}

function scoreByKeywords(content: string, query: string): number {
  const normalizedContent = normalize(content)
  const normalizedQuery = normalize(query)
  if (!normalizedContent) {
    return 0
  }

  let score = 0
  if (normalizedQuery && normalizedContent.includes(normalizedQuery)) {
    score += 10
  }

  for (const token of extractTokens(query)) {
    if (normalizedContent.includes(token)) {
      score += 2
    }
  }

  return score
}

function dotProduct(left: number[], right: number[]): number {
  return left.reduce((sum, value, index) => sum + value * (right[index] ?? 0), 0)
}

export interface RetrievalResult {
  confidence: RetrievalConfidence
  citations: CitationRecord[]
  chunks: DocumentChunkRecord[]
}

export async function retrieveForTenant(input: {
  tenantId: string
  query: string
  repository: RagRepository
  topK?: number
  embedQuery?: (query: string) => Promise<number[]>
}): Promise<RetrievalResult> {
  const documents = await input.repository.listDocumentsByTenant(input.tenantId)
  const queryEmbedding = input.embedQuery ? await input.embedQuery(input.query) : undefined
  const scored: Array<{ chunk: DocumentChunkRecord; title: string; sourceUri: string; score: number }> = []

  for (const document of documents) {
    const chunks = await input.repository.listChunksByDocument(document.id)

    for (const chunk of chunks) {
      const keywordScore = scoreByKeywords(chunk.content, input.query)
      const vectorScore =
        queryEmbedding && chunk.embedding?.length ? dotProduct(queryEmbedding, chunk.embedding) : 0
      const score = keywordScore + vectorScore

      if (score <= 0) {
        continue
      }

      scored.push({
        chunk,
        title: document.title,
        sourceUri: document.sourceUri,
        score
      })
    }
  }

  scored.sort((left, right) => right.score - left.score)
  const hits = scored.slice(0, input.topK ?? 3)

  const confidence: RetrievalConfidence =
    hits.length === 0 ? 'miss' : (hits[0]?.score ?? 0) >= 10 ? 'high' : 'low'

  return {
    confidence,
    chunks: hits.map((item) => item.chunk),
    citations: hits.map((item) => ({
      documentId: item.chunk.documentId,
      chunkId: item.chunk.id,
      title: item.title,
      snippet: item.chunk.content.slice(0, 160),
      score: item.score,
      sourceUri: item.sourceUri,
      metadata: item.chunk.metadata
    }))
  }
}
