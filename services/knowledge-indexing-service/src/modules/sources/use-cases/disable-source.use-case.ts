import type { DisableSourceResponse } from '../../../../../../packages/contracts/src/indexing/source.contract.ts'
import type { KnowledgeIndexingRepository } from '../../../domain/repositories/knowledge-indexing.repository.ts'
import type { DataSourceRecord } from '../../../../../../types'

export class DisableSourceUseCase {
  private readonly repository: KnowledgeIndexingRepository

  constructor(repository: KnowledgeIndexingRepository) {
    this.repository = repository
  }

  async execute(input: { tenantId: string; sourceId: string }): Promise<DisableSourceResponse> {
    const current = await this.repository.getDataSourceById(input.sourceId)
    if (!current || current.tenantId !== input.tenantId) {
      throw new Error('Source not found')
    }

    const updated: DataSourceRecord = {
      ...current,
      status: 'disabled',
      updatedAt: Date.now()
    }

    await this.repository.saveDataSource(updated)
    return { ok: true, item: updated }
  }
}
