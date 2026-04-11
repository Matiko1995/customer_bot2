import type { ListTenantsResponse } from '../../../../../../packages/contracts/src/tenant/tenant.contract'
import type { TenantIdentityRepository } from '../../../domain/repositories/tenant-identity.repository'

export class ListTenantsUseCase {
  private readonly repository: TenantIdentityRepository

  constructor(repository: TenantIdentityRepository) {
    this.repository = repository
  }

  async execute(input?: { includeDeleted?: boolean }): Promise<ListTenantsResponse> {
    const items = await this.repository.listTenants()
    return {
      items: input?.includeDeleted ? items : items.filter((item) => !item.deletedAt)
    }
  }
}
