import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { NormalizedSourceDocument } from '../ingestion/normalize-document.ts'
import { renderAgentDoc } from './render-agent-doc.ts'

const defaultDocNames = ['AGENTS.md', 'BOOTSTRAP.md', 'HEARTBEAT.md', 'IDENTITY.md', 'SOUL.md', 'USER.md', 'TOOLS.md'] as const

export interface AgentDocBundleResult {
  outputDir: string
  files: string[]
}

async function readExistingContent(path: string): Promise<string | undefined> {
  try {
    return await readFile(path, 'utf8')
  } catch {
    return undefined
  }
}

function summarizeDocuments(documents: NormalizedSourceDocument[]): string[] {
  return documents.slice(0, 8).map((document, index) => {
    const snippet = document.contentText.replace(/\s+/g, ' ').slice(0, 120)
    return `${index + 1}. ${document.title}：${snippet || '暂无正文摘录'}`
  })
}

function buildGeneratedSections(input: {
  tenantId: string
  documents: NormalizedSourceDocument[]
  generatedAt: number
}): Record<(typeof defaultDocNames)[number], string> {
  const summaries = summarizeDocuments(input.documents)
  const sourceCount = input.documents.length
  const updatedAt = new Date(input.generatedAt).toLocaleString('zh-CN', { hour12: false })

  return {
    'AGENTS.md': [
      '## 职责',
      `- 当前 agent 服务于租户 ${input.tenantId}。`,
      '- 回答时优先基于已导入资料，不应脱离资料编造事实。',
      '- 对价格类问题应优先依赖结构化数据，不应自由估价。',
      '',
      '## 当前资料摘要',
      ...summaries
    ].join('\n'),
    'BOOTSTRAP.md': [
      '## 初始化顺序',
      '1. 读取租户基础配置',
      '2. 加载已导入文档和索引状态',
      '3. 启用 FAQ / 价格结构化直达能力',
      '4. 启用 RAG 检索能力',
      '5. 对未命中的非价格问题启用共享模型兜底'
    ].join('\n'),
    'HEARTBEAT.md': [
      '## 当前状态',
      `- 最近生成时间：${updatedAt}`,
      `- 当前已导入文档数：${sourceCount}`,
      '- 应定期检查资料同步、索引状态和失败任务。',
      '- 如资料更新，应重新执行导入以刷新自动生成区块。'
    ].join('\n'),
    'IDENTITY.md': [
      '## 身份',
      `- 租户标识：${input.tenantId}`,
      '- 该 agent 代表当前租户的业务身份进行回答。',
      '- 回答要保持专业、简洁、可执行。'
    ].join('\n'),
    'SOUL.md': [
      '## 风格',
      '- 使用中文编写。',
      '- 语气专业、克制，不夸张承诺。',
      '- 不编造资料中不存在的产品参数、价格或交付承诺。'
    ].join('\n'),
    'USER.md': [
      '## 用户画像',
      '- 用户通常会咨询产品、方案、报价、交付、能力范围等问题。',
      '- 如当前资料不能直接命中，应明确说明并提示进一步确认。',
      '',
      '## 当前高优先级资料',
      ...summaries
    ].join('\n'),
    'TOOLS.md': [
      '## 能力清单',
      '- 结构化 FAQ / 标准回复',
      '- 结构化价格与产品参数查询',
      '- 基于导入资料的 RAG 检索与引用',
      '- 非价格未命中时的平台共享模型兜底',
      '',
      '## 当前资料源规模',
      `- 已导入文档数：${sourceCount}`
    ].join('\n')
  }
}

export async function generateAgentDocBundle(input: {
  tenantId: string
  documents: NormalizedSourceDocument[]
  outputRoot?: string
  generatedAt?: number
}): Promise<AgentDocBundleResult> {
  const generatedAt = input.generatedAt ?? Date.now()
  const outputDir = input.outputRoot ?? join(process.cwd(), '.data', 'agent-docs', input.tenantId, 'latest')
  const sections = buildGeneratedSections({
    tenantId: input.tenantId,
    documents: input.documents,
    generatedAt
  })

  await mkdir(outputDir, { recursive: true })

  for (const fileName of defaultDocNames) {
    const fullPath = join(outputDir, fileName)
    const existingContent = await readExistingContent(fullPath)
    const rendered = renderAgentDoc({
      title: fileName,
      description: `该文件面向租户 ${input.tenantId} 的 agent 运行说明。`,
      generatedBody: sections[fileName],
      existingContent
    })

    await writeFile(fullPath, rendered, 'utf8')
  }

  return {
    outputDir,
    files: [...defaultDocNames]
  }
}
