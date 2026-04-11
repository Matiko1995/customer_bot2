export interface FallbackAnswerModel {
  respond(prompt: string): Promise<string>
}

export async function generateFallbackAnswer(input: {
  query: string
  brandName?: string
  model?: FallbackAnswerModel
  instructions?: string
}): Promise<string> {
  const prompt = [
    '当前租户资料未直接命中，请提供通用但谨慎的回答。',
    '不要编造价格、参数、交付承诺。',
    `品牌：${input.brandName || '当前租户'}`,
    `问题：${input.query}`,
    input.instructions?.trim() || ''
  ].join('\n')

  if (input.model) {
    return input.model.respond(prompt)
  }

  return [
    '当前资料未直接命中，以下为通用参考答复：',
    `- 问题：${input.query}`,
    input.instructions?.trim() ? `- 回答结构参考：${input.instructions.trim()}` : '',
    '- 建议：请结合租户最新资料或人工进一步确认关键事实。'
  ].filter(Boolean).join('\n')
}
