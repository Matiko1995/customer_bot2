import type { TenantResetCodeResponse } from '../../../../../../packages/contracts/src/tenant/auth.contract'
import type { TenantIdentityRepository } from '../../../domain/repositories/tenant-identity.repository'

export class IssueTenantResetCodeUseCase {
  private readonly repository: TenantIdentityRepository
  private readonly issueTenantPasswordReset: (input: { email: string }) => Promise<{ email: string; code: string; expiresAt: number; tenantId: string }>
  private readonly sendTenantResetEmail: (input: {
    to: string
    code: string
    expiresAt: number
    tenantName: string
    loginUrl: string
  }) => Promise<{ provider: string; previewCode?: string }>

  constructor(
    repository: TenantIdentityRepository,
    issueTenantPasswordReset: (input: { email: string }) => Promise<{ email: string; code: string; expiresAt: number; tenantId: string }>,
    sendTenantResetEmail: (input: {
      to: string
      code: string
      expiresAt: number
      tenantName: string
      loginUrl: string
    }) => Promise<{ provider: string; previewCode?: string }>
  ) {
    this.repository = repository
    this.issueTenantPasswordReset = issueTenantPasswordReset
    this.sendTenantResetEmail = sendTenantResetEmail
  }

  async execute(input: {
    tenantId: string
    email?: string
    loginUrl: string
  }): Promise<TenantResetCodeResponse> {
    const tenant = await this.repository.getTenantById(input.tenantId.trim())
    if (!tenant || tenant.deletedAt) {
      throw new Error('Tenant not found')
    }

    const email = (input.email || tenant.contactEmail || '').trim()
    if (!email) {
      throw new Error('Tenant contact email is required')
    }

    const reset = await this.issueTenantPasswordReset({ email })
    const sent = await this.sendTenantResetEmail({
      to: reset.email,
      code: reset.code,
      expiresAt: reset.expiresAt,
      tenantName: tenant.name,
      loginUrl: input.loginUrl
    })

    return {
      ok: true,
      item: {
        email: reset.email,
        expiresAt: reset.expiresAt,
        provider: sent.provider,
        previewCode: sent.previewCode
      }
    }
  }
}
