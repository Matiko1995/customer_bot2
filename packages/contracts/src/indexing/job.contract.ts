import type { IngestionJobRecord } from '../../../../types'

export interface ListJobsResponse {
  items: IngestionJobRecord[]
}

export interface IndexStatsResponse {
  documentCount: number
  chunkCount: number
  lastSuccessfulSyncAt?: number
}

export interface RetryJobResponse {
  ok: true
  item: IngestionJobRecord
  documentCount: number
  chunkCount: number
}

export interface ReindexAllResponse {
  ok: true
  triggeredSourceCount: number
  successCount: number
  failureCount: number
  documentCount: number
  chunkCount: number
  jobs: IngestionJobRecord[]
  failures: Array<{
    sourceId: string
    message: string
  }>
}
