import type { ListTenantUsersResponse, TenantMeResponse } from '../../../../../../packages/contracts/src/tenant/tenant-user.contract'
import type { TenantIdentityRepository } from '../../../domain/repositories/tenant-identity.repository'

export class ListTenantUsersUseCase {
  private readonly repository: TenantIdentityRepository

  constructor(repository: TenantIdentityRepository) {
    this.repository = repository
  }

  async execute(tenantId: string): Promise<ListTenantUsersResponse> {
    return {
      items: await this.repository.listTenantUsersByTenant(tenantId.trim())
    }
  }
}

export class GetTenantMeUseCase {
  private readonly repository: TenantIdentityRepository

  constructor(repository: TenantIdentityRepository) {
    this.repository = repository
  }

  async execute(input: { tenantUserId: string; tenantId: string }): Promise<TenantMeResponse> {
    const user = await this.repository.getTenantUserById(input.tenantUserId)
    const tenant = await this.repository.getTenantById(input.tenantId)

    if (!user || !tenant || user.status !== 'active' || tenant.deletedAt) {
      throw new Error('Unauthorized')
    }

    return {
      user,
      tenant
    }
  }
}
