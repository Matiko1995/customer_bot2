import type { CreateTenantRequest, CreateTenantResponse } from '../../../../../../packages/contracts/src/tenant/tenant.contract'
import { normalizeTenantRagSettings } from '../../../../../../packages/shared-config/src/rag-settings.ts'
import type { TenantRecord } from '../../../../../../types'
import type { TenantIdentityRepository } from '../../../domain/repositories/tenant-identity.repository'

function nextTenantId(): string {
  return `tenant-${Date.now()}`
}

export class CreateTenantUseCase {
  private readonly repository: TenantIdentityRepository
  private readonly createTenantLogin: (input: { tenant: TenantRecord; now?: number }) => Promise<{
    user: { email: string; mustChangePassword: boolean }
    initialPassword: string
  }>

  constructor(
    repository: TenantIdentityRepository,
    createTenantLogin: (input: { tenant: TenantRecord; now?: number }) => Promise<{
      user: { email: string; mustChangePassword: boolean }
      initialPassword: string
    }>
  ) {
    this.repository = repository
    this.createTenantLogin = createTenantLogin
  }

  async execute(input: CreateTenantRequest & Partial<TenantRecord>): Promise<CreateTenantResponse> {
    const now = Date.now()
    const tenant: TenantRecord = {
      id: input.id?.trim() || nextTenantId(),
      name: input.name?.trim() || 'New Tenant',
      status: input.status === 'disabled' ? 'disabled' : 'active',
      brandName: input.brandName?.trim() || input.name?.trim() || 'New Tenant',
      themeColor: input.themeColor?.trim() || '#118ab2',
      contactPhone: input.contactPhone?.trim() || '',
      contactEmail: input.contactEmail?.trim() || '',
      contactAddress: input.contactAddress?.trim() || '',
      systemPrompt: input.systemPrompt?.trim() || 'You are the tenant bot.',
      llmEndpoint: input.llmEndpoint?.trim() || '',
      llmApiKey: input.llmApiKey?.trim() || '',
      llmModel: input.llmModel?.trim() || '',
      reuseAnsweredQuestions: input.reuseAnsweredQuestions !== false,
      deletedAt: undefined,
      embedKey: input.embedKey?.trim() || `embed-${Math.random().toString(36).slice(2, 10)}`,
      ragSettings: normalizeTenantRagSettings(input.ragSettings),
      billingSubscription: input.billingSubscription ?? {
        planId: 'plan-basic',
        startedAt: now,
        notes: ''
      },
      contentConfig: input.contentConfig,
      createdAt: now,
      updatedAt: now
    }

    await this.repository.saveTenant(tenant)
    const tenantLogin = await this.createTenantLogin({ tenant, now })

    return {
      ok: true,
      item: tenant,
      tenantLogin: {
        email: tenantLogin.user.email,
        initialPassword: tenantLogin.initialPassword,
        mustChangePassword: tenantLogin.user.mustChangePassword
      }
    }
  }
}
