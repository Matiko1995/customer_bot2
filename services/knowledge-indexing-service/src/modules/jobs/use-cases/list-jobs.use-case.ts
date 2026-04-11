import type { ListJobsResponse } from '../../../../../../packages/contracts/src/indexing/job.contract.ts'
import type { KnowledgeIndexingRepository } from '../../../domain/repositories/knowledge-indexing.repository.ts'

export class ListJobsUseCase {
  private readonly repository: KnowledgeIndexingRepository

  constructor(repository: KnowledgeIndexingRepository) {
    this.repository = repository
  }

  async execute(tenantId: string): Promise<ListJobsResponse> {
    const items = await this.repository.listIngestionJobsByTenant(tenantId.trim())
    return {
      items: items.sort((left, right) => {
        const leftTime = left.finishedAt ?? left.startedAt ?? 0
        const rightTime = right.finishedAt ?? right.startedAt ?? 0
        return rightTime - leftTime
      })
    }
  }
}
