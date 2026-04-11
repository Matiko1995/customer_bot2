import { createHash } from 'node:crypto'

export interface NormalizedSourceDocument {
  externalId?: string
  title: string
  mimeType: string
  sourceUri: string
  contentText: string
  metadata: Record<string, unknown>
}

export function normalizeDocument(input: NormalizedSourceDocument): NormalizedSourceDocument {
  return {
    externalId: input.externalId,
    title: input.title.trim(),
    mimeType: input.mimeType.trim(),
    sourceUri: input.sourceUri.trim(),
    contentText: input.contentText.replace(/\r\n/g, '\n').trim(),
    metadata: structuredClone(input.metadata ?? {})
  }
}

export function createContentHash(contentText: string): string {
  return createHash('sha256').update(contentText).digest('hex')
}
