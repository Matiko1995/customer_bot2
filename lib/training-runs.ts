import type { LlmUsageRecord } from '../types'

export const TRAINING_PROVIDER = 'training-simulator'

export interface TrainingRunRecord {
  id: string
  sessionId: string
  provider: string
  model: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  amount: string
  status: LlmUsageRecord['status']
  createdAt: number
}

export function listTrainingRuns(records: LlmUsageRecord[]): TrainingRunRecord[] {
  return records
    .filter((item) => item.provider === TRAINING_PROVIDER)
    .sort((left, right) => right.createdAt - left.createdAt)
    .map((item) => ({
      id: item.id,
      sessionId: item.sessionId,
      provider: item.provider,
      model: item.model,
      inputTokens: item.inputTokens,
      outputTokens: item.outputTokens,
      totalTokens: item.totalTokens,
      amount: item.amount,
      status: item.status,
      createdAt: item.createdAt
    }))
}
