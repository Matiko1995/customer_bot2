import type { GetTenantResponse } from '../../../../../../packages/contracts/src/tenant/tenant.contract'
import type { TenantIdentityRepository } from '../../../domain/repositories/tenant-identity.repository'

export class GetTenantUseCase {
  private readonly repository: TenantIdentityRepository

  constructor(repository: TenantIdentityRepository) {
    this.repository = repository
  }

  async execute(tenantId: string): Promise<GetTenantResponse> {
    const tenant = await this.repository.getTenantById(tenantId.trim())
    if (!tenant || tenant.deletedAt) {
      throw new Error('Tenant not found')
    }

    const tenantUsers = await this.repository.listTenantUsersByTenant(tenant.id)

    return {
      item: tenant,
      tenantUsers
    }
  }
}
