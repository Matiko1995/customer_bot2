import type { CitationRecord, DocumentChunkRecord, RetrievalConfidence, SourceDocumentRecord } from '../../../types'
import type { KnowledgeIndexingRepository } from '../../../services/knowledge-indexing-service/src/domain/repositories/knowledge-indexing.repository.ts'
import type { VectorIndexProvider } from './vector-index-provider.ts'

function buildCitation(chunk: DocumentChunkRecord, document: SourceDocumentRecord | undefined, score: number): CitationRecord {
  return {
    documentId: chunk.documentId,
    chunkId: chunk.id,
    title: String(chunk.metadata.title || document?.title || 'Untitled Chunk'),
    snippet: chunk.content.slice(0, 160),
    score,
    sourceUri: String(chunk.metadata.sourceUri || document?.sourceUri || ''),
    metadata: chunk.metadata
  }
}

export async function retrieveForTenantWithVectorIndex(input: {
  tenantId: string
  queryVector: number[]
  topK?: number
  repository: KnowledgeIndexingRepository
  vectorIndex: VectorIndexProvider
}): Promise<{
  confidence: RetrievalConfidence
  chunks: DocumentChunkRecord[]
  citations: CitationRecord[]
}> {
  const documents = await input.repository.listSourceDocumentsByTenant(input.tenantId)
  const documentMap = new Map(documents.map((item) => [item.id, item]))
  const chunkPool: DocumentChunkRecord[] = []

  for (const document of documents) {
    const chunks = await input.repository.listDocumentChunksByDocument(document.id)
    chunkPool.push(...chunks)
  }

  const chunkMap = new Map(chunkPool.map((item) => [item.id, item]))
  const matches = await input.vectorIndex.query({
    vector: input.queryVector,
    topK: input.topK ?? 5,
    filter: {
      tenantId: input.tenantId
    },
    returnMetadata: true
  })

  const chunks = matches.matches
    .map((match) => ({
      chunk: chunkMap.get(match.id),
      score: match.score
    }))
    .filter((item): item is { chunk: DocumentChunkRecord; score: number } => Boolean(item.chunk))

  const confidence: RetrievalConfidence =
    chunks.length === 0 ? 'miss' : (chunks[0]?.score ?? 0) >= 0.5 ? 'high' : 'low'

  return {
    confidence,
    chunks: chunks.map((item) => item.chunk),
    citations: chunks.map((item) => buildCitation(item.chunk, documentMap.get(item.chunk.documentId), item.score))
  }
}
