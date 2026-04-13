import { createHash } from 'node:crypto'
import type { EmbeddedChunk, PreparedChunk } from './types.ts'

export interface ChunkEmbedder {
  embedDocuments(texts: string[]): Promise<number[][]>
}

export function createDeterministicEmbedding(value: string): number[] {
  const digest = createHash('sha256').update(value).digest()

  return Array.from(digest.slice(0, 8)).map((item) => Number((item / 255).toFixed(6)))
}

export async function embedChunks(chunks: PreparedChunk[], embedder?: ChunkEmbedder): Promise<EmbeddedChunk[]> {
  const vectors = embedder
    ? await embedder.embedDocuments(chunks.map((chunk) => chunk.content))
    : chunks.map((chunk) => createDeterministicEmbedding(chunk.content))

  return chunks.map((chunk, index) => ({
    ...chunk,
    embedding: vectors[index] ?? []
  }))
}
