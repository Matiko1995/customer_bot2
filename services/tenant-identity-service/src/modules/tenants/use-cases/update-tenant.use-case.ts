import type { UpdateTenantRequest, UpdateTenantResponse } from '../../../../../../packages/contracts/src/tenant/tenant.contract'
import { normalizeTenantRagSettings } from '../../../../../../packages/shared-config/src/rag-settings.ts'
import type { TenantRecord } from '../../../../../../types'
import type { TenantIdentityRepository } from '../../../domain/repositories/tenant-identity.repository'

export class UpdateTenantUseCase {
  private readonly repository: TenantIdentityRepository

  constructor(repository: TenantIdentityRepository) {
    this.repository = repository
  }

  async execute(tenantId: string, body: UpdateTenantRequest & Partial<TenantRecord>): Promise<UpdateTenantResponse> {
    const existing = await this.repository.getTenantById(tenantId.trim())
    if (!existing || existing.deletedAt) {
      throw new Error('Tenant not found')
    }

    const updated: TenantRecord = {
      ...existing,
      ...body,
      llmEndpoint: body.llmEndpoint !== undefined ? body.llmEndpoint?.trim() || '' : existing.llmEndpoint,
      llmApiKey: body.llmApiKey !== undefined ? body.llmApiKey?.trim() || '' : existing.llmApiKey,
      llmModel: body.llmModel !== undefined ? body.llmModel?.trim() || '' : existing.llmModel,
      reuseAnsweredQuestions:
        body.reuseAnsweredQuestions !== undefined ? body.reuseAnsweredQuestions !== false : existing.reuseAnsweredQuestions,
      ragSettings: normalizeTenantRagSettings({
        ...existing.ragSettings,
        ...body.ragSettings
      }),
      id: existing.id,
      embedKey: existing.embedKey,
      createdAt: existing.createdAt,
      updatedAt: Date.now()
    }

    await this.repository.saveTenant(updated)

    return {
      ok: true,
      item: updated
    }
  }
}
