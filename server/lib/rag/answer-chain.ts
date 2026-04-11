import type { CitationRecord } from '../../../types'
import { buildCitationContext } from './build-context.ts'

export interface GroundedAnswerModel {
  respond(prompt: string): Promise<string>
}

export async function generateGroundedAnswer(input: {
  query: string
  citations: CitationRecord[]
  model?: GroundedAnswerModel
  instructions?: string
}): Promise<string> {
  const context = buildCitationContext({
    query: input.query,
    citations: input.citations
  })

  if (input.model) {
    return input.model.respond([
      '请严格基于以下资料回答，不要编造。',
      input.instructions?.trim() || '',
      context
    ].filter(Boolean).join('\n\n'))
  }

  const lines = [
    '基于当前命中资料，整理答复如下：',
    `问题：${input.query}`
  ]

  if (input.instructions?.trim()) {
    lines.push(`回答结构参考：${input.instructions.trim()}`)
  }

  input.citations.forEach((citation, index) => {
    lines.push(`${index + 1}. ${citation.title}：${citation.snippet}`)
  })

  return lines.join('\n')
}
