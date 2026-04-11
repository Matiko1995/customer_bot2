import type { NormalizedSourceDocument } from './normalize-document.ts'
import type { PreparedChunk } from './types.ts'

export interface ChunkingOptions {
  maxCharacters?: number
  overlapCharacters?: number
  structureTemplate?: string
}

function normalizeTemplateLines(value: string | undefined): string[] {
  return (value || '')
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function summarizeContent(value: string): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, 220)
}

function extractTemplateValue(label: string, document: NormalizedSourceDocument): string {
  const normalized = label.toLowerCase()
  const content = summarizeContent(document.contentText)

  if (normalized.includes('标题') || normalized.includes('产品名称') || normalized.includes('名称')) {
    return document.title
  }

  if (normalized.includes('来源')) {
    return document.sourceUri
  }

  if (normalized.includes('摘要') || normalized.includes('关键') || normalized.includes('场景')) {
    return content
  }

  if (normalized.includes('标准')) {
    return document.contentText.match(/\b(?:GB|DIN|ISO|ANSI)[A-Z0-9-]*/i)?.[0] || content
  }

  if (normalized.includes('材质')) {
    return document.contentText.match(/\b(?:304|316|35K|45#|SCM435|不锈钢|碳钢|合金钢)\b/i)?.[0] || content
  }

  if (normalized.includes('等级')) {
    return document.contentText.match(/\b(?:4\.8|6\.8|8\.8|10\.9|12\.9)\b/)?.[0] || content
  }

  if (normalized.includes('规格') || normalized.includes('尺寸')) {
    return document.contentText.match(/\bM\d+(?:[xX*]\d+)?\b/i)?.[0] || content
  }

  return content
}

function buildStructuredPrelude(document: NormalizedSourceDocument, structureTemplate: string | undefined): string {
  const lines = normalizeTemplateLines(structureTemplate)
  if (!lines.length) {
    return ''
  }

  return lines.map((label) => `${label}：${extractTemplateValue(label, document)}`).join('\n')
}

export function chunkDocument(document: NormalizedSourceDocument, options: ChunkingOptions = {}): PreparedChunk[] {
  const maxCharacters = options.maxCharacters ?? 500
  const overlapCharacters = Math.max(0, options.overlapCharacters ?? 0)
  const structuredPrelude = buildStructuredPrelude(document, options.structureTemplate)
  const contentText = structuredPrelude ? `${structuredPrelude}\n\n${document.contentText}` : document.contentText
  const segments = contentText
    .split(/\n{2,}/)
    .map((segment) => segment.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  const chunks: PreparedChunk[] = []
  const sourceSegments = segments.length ? segments : [document.contentText.trim()].filter(Boolean)

    for (const segment of sourceSegments) {
      if (segment.length <= maxCharacters) {
      chunks.push({
        content: segment,
        chunkIndex: chunks.length,
        tokenCount: Math.max(1, Math.ceil(segment.length / 4)),
        metadata: {
          title: document.title,
          sourceUri: document.sourceUri
        }
      })
      continue
      }

    const step = Math.max(1, maxCharacters - overlapCharacters)
    for (let index = 0; index < segment.length; index += step) {
      const slice = segment.slice(index, index + maxCharacters).trim()
      if (!slice) {
        continue
      }

      chunks.push({
        content: slice,
        chunkIndex: chunks.length,
        tokenCount: Math.max(1, Math.ceil(slice.length / 4)),
        metadata: {
          title: document.title,
          sourceUri: document.sourceUri
        }
      })
    }
  }

  return chunks
}
