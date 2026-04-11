const customStart = '<!-- CUSTOM:START -->'
const customEnd = '<!-- CUSTOM:END -->'
const generatedStart = '<!-- GENERATED:START -->'
const generatedEnd = '<!-- GENERATED:END -->'

function extractSection(content: string | undefined, start: string, end: string): string {
  if (!content) {
    return ''
  }

  const startIndex = content.indexOf(start)
  const endIndex = content.indexOf(end)
  if (startIndex < 0 || endIndex < 0 || endIndex <= startIndex) {
    return ''
  }

  return content.slice(startIndex + start.length, endIndex).trim()
}

export interface RenderAgentDocInput {
  title: string
  description: string
  generatedBody: string
  existingContent?: string
}

export function renderAgentDoc(input: RenderAgentDocInput): string {
  const preservedCustom = extractSection(input.existingContent, customStart, customEnd)
  const customBody = preservedCustom || '请在这里补充人工维护的说明。'

  return [
    `# ${input.title}`,
    '',
    input.description,
    '',
    '说明：本文件可编辑。重新导入资料时，会刷新自动生成区块，但会保留“自定义补充”区块内容。',
    '',
    customStart,
    customBody,
    customEnd,
    '',
    generatedStart,
    input.generatedBody.trim(),
    generatedEnd,
    ''
  ].join('\n')
}
