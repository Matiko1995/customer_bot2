import type { CreateSourceRequest, CreateSourceResponse } from '../../../../../../packages/contracts/src/indexing/source.contract.ts'
import type { KnowledgeIndexingRepository } from '../../../domain/repositories/knowledge-indexing.repository.ts'
import type { DataSourceRecord } from '../../../../../../types'

function nextSourceId(): string {
  return `source-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export class CreateSourceUseCase {
  private readonly repository: KnowledgeIndexingRepository

  constructor(repository: KnowledgeIndexingRepository) {
    this.repository = repository
  }

  async execute(input: { tenantId: string } & CreateSourceRequest): Promise<CreateSourceResponse> {
    const now = Date.now()
    const source: DataSourceRecord = {
      id: nextSourceId(),
      tenantId: input.tenantId,
      type: input.type,
      status: 'active',
      syncMode: input.syncMode,
      scheduleCron: input.scheduleCron?.trim() || '',
      config: input.config ?? {},
      lastSyncedAt: undefined,
      createdAt: now,
      updatedAt: now
    }

    await this.repository.saveDataSource(source)
    return { ok: true, item: source }
  }
}
