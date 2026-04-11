import { createHash } from 'node:crypto'
import type { BasicOkResponse, TenantResetPasswordRequest } from '../../../../../../packages/contracts/src/tenant/auth.contract'
import type { TenantIdentityRepository } from '../../../domain/repositories/tenant-identity.repository'

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

export class ChangeTenantPasswordUseCase {
  private readonly repository: TenantIdentityRepository
  private readonly verifyTenantPassword: (email: string, password: string) => Promise<{ id: string; tenantId: string; email: string; passwordHash: string; mustChangePassword: boolean; status: 'active' | 'disabled'; createdAt: number; updatedAt: number; temporaryPassword?: string } | null>

  constructor(
    repository: TenantIdentityRepository,
    verifyTenantPassword: (email: string, password: string) => Promise<{ id: string; tenantId: string; email: string; passwordHash: string; mustChangePassword: boolean; status: 'active' | 'disabled'; createdAt: number; updatedAt: number; temporaryPassword?: string } | null>
  ) {
    this.repository = repository
    this.verifyTenantPassword = verifyTenantPassword
  }

  async execute(input: {
    tenantUserId: string
    tenantId: string
    email: string
    currentPassword: string
    nextPassword: string
  }): Promise<BasicOkResponse> {
    if (!input.currentPassword || !input.nextPassword) {
      throw new Error('currentPassword and nextPassword are required')
    }

    const user = await this.verifyTenantPassword(input.email, input.currentPassword)
    if (!user || user.id !== input.tenantUserId || user.tenantId !== input.tenantId) {
      throw new Error('Invalid credentials')
    }

    await this.repository.saveTenantUser({
      ...user,
      passwordHash: hashPassword(input.nextPassword),
      temporaryPassword: '',
      mustChangePassword: false,
      updatedAt: Date.now()
    })

    return { ok: true }
  }
}

export class ResetTenantPasswordUseCase {
  private readonly resetTenantPassword: (input: TenantResetPasswordRequest) => Promise<{
    id: string
    email: string
    tenantId: string
    mustChangePassword: boolean
  }>

  constructor(
    resetTenantPassword: (input: TenantResetPasswordRequest) => Promise<{
      id: string
      email: string
      tenantId: string
      mustChangePassword: boolean
    }>
  ) {
    this.resetTenantPassword = resetTenantPassword
  }

  async execute(input: TenantResetPasswordRequest) {
    const user = await this.resetTenantPassword(input)

    return {
      ok: true,
      user: {
        tenantUserId: user.id,
        email: user.email,
        tenantId: user.tenantId,
        mustChangePassword: user.mustChangePassword
      }
    }
  }
}
