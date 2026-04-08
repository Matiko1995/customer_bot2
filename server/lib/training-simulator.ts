import type { LlmUsageRecord, TenantRecord } from '../../types'
import { TRAINING_PROVIDER } from '../../lib/training-runs'
import type { StorageRepository } from './storage/types'

const TRAINING_COST_PER_THOUSAND_TOKENS = 0.12
const TRAINING_MODEL = 'training-indexer-v1'

export interface TrainingEstimate {
  sourceCount: number
  assetCount: number
  characterCount: number
  inputTokens: number
  outputTokens: number
  totalTokens: number
  amount: string
}

export interface TrainingSimulationResult extends TrainingEstimate {
  record: LlmUsageRecord
}

function buildTrainingCorpus(tenant: TenantRecord): string[] {
  const content = tenant.contentConfig
  if (!content) {
    return []
  }

  const enabledSources = (content.contentSources ?? []).filter((item) => item.enabled !== false)
  const sourceTexts = enabledSources.map((item) =>
    [item.title, item.summary, item.content, item.sourceLabel, item.sourceUrl, ...(item.tags ?? [])].filter(Boolean).join('\n')
  )

  const knowledgeTexts = (content.knowledgeEntries ?? []).map((item) =>
    [
      item.title,
      item.oneLiner,
      item.whatIs,
      item.source,
      ...item.keywords,
      ...item.problems,
      ...item.workflow,
      ...item.scenarios,
      ...item.outcomes
    ]
      .filter(Boolean)
      .join('\n')
  )

  const articleTexts = (content.articles ?? []).map((item) => [item.title, item.category, item.summary].filter(Boolean).join('\n'))
  const productTexts = (content.products ?? []).map((item) =>
    [item.name, item.category, item.summary, item.priceText, ...(item.parameters ?? []).map((param) => `${param.label}:${param.value}`)]
      .filter(Boolean)
      .join('\n')
  )
  const serviceTexts = (content.consultingServices ?? []).map((item) =>
    [item.name, item.category, item.introduction, item.price, item.negotiable ? 'negotiable' : 'fixed']
      .filter(Boolean)
      .join('\n')
  )

  return [...sourceTexts, ...knowledgeTexts, ...articleTexts, ...productTexts, ...serviceTexts]
    .map((item) => item.trim())
    .filter(Boolean)
}

function toMoney(value: number): string {
  return value.toFixed(2)
}

export function estimateTrainingRun(tenant: TenantRecord): TrainingEstimate {
  const corpus = buildTrainingCorpus(tenant)
  const sourceCount = tenant.contentConfig?.contentSources?.filter((item) => item.enabled !== false).length ?? 0

  if (!corpus.length) {
    throw new Error('当前租户没有可训练内容，请先添加资料源或内容配置')
  }

  const characterCount = corpus.reduce((sum, item) => sum + item.length, 0)
  const assetCount = corpus.length
  const inputTokens = Math.max(256, Math.ceil(characterCount / 4) + assetCount * 48)
  const outputTokens = Math.max(96, Math.ceil(inputTokens * 0.08))
  const totalTokens = inputTokens + outputTokens
  const amount = toMoney((totalTokens / 1000) * TRAINING_COST_PER_THOUSAND_TOKENS)

  return {
    sourceCount,
    assetCount,
    characterCount,
    inputTokens,
    outputTokens,
    totalTokens,
    amount
  }
}

export async function simulateTenantTraining(input: {
  tenant: TenantRecord
  storage: StorageRepository
  now?: number
}): Promise<TrainingSimulationResult> {
  const createdAt = input.now ?? Date.now()
  const estimate = estimateTrainingRun(input.tenant)
  const record: LlmUsageRecord = {
    id: `usage-training-${createdAt}`,
    tenantId: input.tenant.id,
    sessionId: `training-${input.tenant.id}-${createdAt}`,
    provider: TRAINING_PROVIDER,
    model: TRAINING_MODEL,
    inputTokens: estimate.inputTokens,
    outputTokens: estimate.outputTokens,
    totalTokens: estimate.totalTokens,
    amount: estimate.amount,
    status: 'success',
    createdAt
  }

  await input.storage.saveUsageRecord(record)

  return {
    ...estimate,
    record
  }
}
