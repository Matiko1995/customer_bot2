import type { BasicOkResponse } from '../../../../../../packages/contracts/src/tenant/auth.contract'
import type { TenantIdentityRepository } from '../../../domain/repositories/tenant-identity.repository'

export class DeleteTenantUseCase {
  private readonly repository: TenantIdentityRepository

  constructor(repository: TenantIdentityRepository) {
    this.repository = repository
  }

  async execute(tenantId: string): Promise<BasicOkResponse> {
    const tenant = await this.repository.getTenantById(tenantId.trim())
    if (!tenant || tenant.deletedAt) {
      throw new Error('Tenant not found')
    }

    const updatedAt = Date.now()
    await this.repository.saveTenant({
      ...tenant,
      status: 'disabled',
      deletedAt: updatedAt,
      updatedAt
    })

    return { ok: true }
  }
}
