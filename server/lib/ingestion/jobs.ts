import type { IngestionJobRecord, IngestionTriggerMode } from '../../../types'

function nextJobId(prefix = 'ingestion-job'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createQueuedIngestionJob(input: {
  tenantId: string
  dataSourceId: string
  triggerMode: IngestionTriggerMode
}): IngestionJobRecord {
  return {
    id: nextJobId(),
    tenantId: input.tenantId,
    dataSourceId: input.dataSourceId,
    triggerMode: input.triggerMode,
    status: 'queued',
    stats: {}
  }
}

export function markJobRunning(job: IngestionJobRecord, now: number): IngestionJobRecord {
  return {
    ...job,
    status: 'running',
    startedAt: now
  }
}

export function markJobSucceeded(job: IngestionJobRecord, now: number, stats: Record<string, unknown>): IngestionJobRecord {
  return {
    ...job,
    status: 'succeeded',
    finishedAt: now,
    stats
  }
}

export function markJobFailed(job: IngestionJobRecord, now: number, errorMessage: string): IngestionJobRecord {
  return {
    ...job,
    status: 'failed',
    finishedAt: now,
    errorMessage
  }
}
