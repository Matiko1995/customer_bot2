import type { DocumentChunkRecord, IngestionJobRecord, SourceDocumentRecord } from '../../../types'
import type { NormalizedSourceDocument } from './normalize-document.ts'

export interface PreparedChunk {
  content: string
  chunkIndex: number
  tokenCount: number
  metadata: Record<string, unknown>
}

export interface EmbeddedChunk extends PreparedChunk {
  embedding: number[]
}

export interface IngestionExecutionResult {
  job: IngestionJobRecord
  documents: SourceDocumentRecord[]
  chunks: DocumentChunkRecord[]
  documentCount: number
  chunkCount: number
}

export type SourceDocumentLoader = () => Promise<NormalizedSourceDocument[]>
