import type { CitationRecord } from '../../../types'

export function buildCitationContext(input: {
  query: string
  citations: CitationRecord[]
}): string {
  const lines = [
    `【用户问题】${input.query}`,
    '【命中资料】'
  ]

  input.citations.forEach((citation, index) => {
    lines.push(`${index + 1}. ${citation.title}`)
    lines.push(`   摘录：${citation.snippet}`)
    if (citation.sourceUri) {
      lines.push(`   来源：${citation.sourceUri}`)
    }
  })

  return lines.join('\n')
}
