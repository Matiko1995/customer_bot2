import { createContentHash, type NormalizedSourceDocument } from './normalize-document.ts'
import { chunkDocument, type ChunkingOptions } from './chunk-document.ts'
import { embedChunks, type ChunkEmbedder } from './embed-chunks.ts'
import { generateAgentDocBundle } from '../agent-docs/generate-agent-doc-bundle.ts'
import { createQueuedIngestionJob, markJobFailed, markJobRunning, markJobSucceeded } from './jobs.ts'
import type { IngestionExecutionResult, SourceDocumentLoader } from './types.ts'
import type { RagRepository } from '../repositories/rag-repository.ts'
import type { DocumentChunkRecord, SourceDocumentRecord } from '../../../types'

function nextDocumentId(prefix = 'document'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function nextChunkId(prefix = 'chunk'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function toDocumentRecord(input: {
  tenantId: string
  dataSourceId: string
  document: NormalizedSourceDocument
  now: number
}): SourceDocumentRecord {
  const hash = createContentHash(input.document.contentText)

  return {
    id: nextDocumentId(),
    tenantId: input.tenantId,
    dataSourceId: input.dataSourceId,
    externalId: input.document.externalId,
    title: input.document.title,
    mimeType: input.document.mimeType,
    sourceUri: input.document.sourceUri,
    contentText: input.document.contentText,
    metadata: input.document.metadata,
    contentHash: hash,
    versionHash: hash,
    createdAt: input.now,
    updatedAt: input.now
  }
}

function toChunkRecords(input: {
  tenantId: string
  documentId: string
  chunks: Awaited<ReturnType<typeof embedChunks>>
  now: number
}): DocumentChunkRecord[] {
  return input.chunks.map((chunk) => ({
    id: nextChunkId(),
    tenantId: input.tenantId,
    documentId: input.documentId,
    chunkIndex: chunk.chunkIndex,
    content: chunk.content,
    tokenCount: chunk.tokenCount,
    metadata: chunk.metadata,
    embedding: chunk.embedding,
    createdAt: input.now
  }))
}

export async function executeIngestionJob(input: {
  tenantId: string
  dataSourceId: string
  triggerMode: 'manual' | 'scheduled' | 'retry'
  repository: RagRepository
  loadDocuments: SourceDocumentLoader
  embedder?: ChunkEmbedder
  chunking?: ChunkingOptions
  now?: number
}): Promise<IngestionExecutionResult> {
  const now = input.now ?? Date.now()
  let job = createQueuedIngestionJob({
    tenantId: input.tenantId,
    dataSourceId: input.dataSourceId,
    triggerMode: input.triggerMode
  })

  await input.repository.saveIngestionJob(job)

  try {
    job = markJobRunning(job, now)
    await input.repository.saveIngestionJob(job)

    const normalizedDocuments = await input.loadDocuments()
    const documentRecords: SourceDocumentRecord[] = []
    const chunkRecords: DocumentChunkRecord[] = []

    for (const document of normalizedDocuments) {
      const documentRecord = toDocumentRecord({
        tenantId: input.tenantId,
        dataSourceId: input.dataSourceId,
        document,
        now
      })

      await input.repository.saveDocument(documentRecord)
      documentRecords.push(documentRecord)

      const embeddedChunks = await embedChunks(chunkDocument(document, input.chunking), input.embedder)
      const nextChunkRecords = toChunkRecords({
        tenantId: input.tenantId,
        documentId: documentRecord.id,
        chunks: embeddedChunks,
        now
      })

      await input.repository.replaceDocumentChunks(documentRecord.id, nextChunkRecords)
      chunkRecords.push(...nextChunkRecords)
    }

    job = markJobSucceeded(job, now, {
      documentCount: documentRecords.length,
      chunkCount: chunkRecords.length
    })
    await input.repository.saveIngestionJob(job)
    await generateAgentDocBundle({
      tenantId: input.tenantId,
      documents: normalizedDocuments,
      generatedAt: now
    })

    return {
      job,
      documents: documentRecords,
      chunks: chunkRecords,
      documentCount: documentRecords.length,
      chunkCount: chunkRecords.length
    }
  } catch (error) {
    job = markJobFailed(job, now, error instanceof Error ? error.message : 'Ingestion failed')
    await input.repository.saveIngestionJob(job)
    throw error
  }
}
