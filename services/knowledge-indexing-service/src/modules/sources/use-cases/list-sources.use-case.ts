import type { ListSourcesResponse } from '../../../../../../packages/contracts/src/indexing/source.contract.ts'
import type { KnowledgeIndexingRepository } from '../../../domain/repositories/knowledge-indexing.repository.ts'

export class ListSourcesUseCase {
  private readonly repository: KnowledgeIndexingRepository

  constructor(repository: KnowledgeIndexingRepository) {
    this.repository = repository
  }

  async execute(tenantId: string): Promise<ListSourcesResponse> {
    return {
      items: await this.repository.listDataSourcesByTenant(tenantId.trim())
    }
  }
}
