import type { BasicOkResponse } from '../../../../../../packages/contracts/src/tenant/auth.contract'
import type { TenantIdentityRepository } from '../../../domain/repositories/tenant-identity.repository'

export class RestoreTenantUseCase {
  private readonly repository: TenantIdentityRepository

  constructor(repository: TenantIdentityRepository) {
    this.repository = repository
  }

  async execute(tenantId: string): Promise<BasicOkResponse> {
    const tenant = await this.repository.getTenantById(tenantId.trim())
    if (!tenant) {
      throw new Error('Tenant not found')
    }

    await this.repository.saveTenant({
      ...tenant,
      status: 'active',
      deletedAt: undefined,
      updatedAt: Date.now()
    })

    return { ok: true }
  }
}
