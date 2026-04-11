import type { UpdateSourceRequest, UpdateSourceResponse } from '../../../../../../packages/contracts/src/indexing/source.contract.ts'
import type { KnowledgeIndexingRepository } from '../../../domain/repositories/knowledge-indexing.repository.ts'
import type { DataSourceRecord } from '../../../../../../types'

export class UpdateSourceUseCase {
  private readonly repository: KnowledgeIndexingRepository

  constructor(repository: KnowledgeIndexingRepository) {
    this.repository = repository
  }

  async execute(input: { tenantId: string; sourceId: string } & UpdateSourceRequest): Promise<UpdateSourceResponse> {
    const current = await this.repository.getDataSourceById(input.sourceId)
    if (!current || current.tenantId !== input.tenantId) {
      throw new Error('Source not found')
    }

    const updated: DataSourceRecord = {
      ...current,
      type: input.type || current.type,
      status: input.status || current.status,
      syncMode: input.syncMode || current.syncMode,
      scheduleCron: input.scheduleCron?.trim() ?? current.scheduleCron,
      config: input.config ?? current.config,
      updatedAt: Date.now()
    }

    await this.repository.saveDataSource(updated)

    return {
      ok: true,
      item: updated
    }
  }
}
