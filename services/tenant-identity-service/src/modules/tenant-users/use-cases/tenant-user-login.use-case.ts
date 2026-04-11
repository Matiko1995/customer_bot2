import type { TenantUserLoginRequest, TenantUserLoginResponse } from '../../../../../../packages/contracts/src/tenant/auth.contract'
import type { TenantUserRecord } from '../../../../../../types'

export class TenantUserLoginUseCase {
  private readonly verifyTenantPassword: (email: string, password: string) => Promise<TenantUserRecord | null>

  constructor(
    verifyTenantPassword: (email: string, password: string) => Promise<TenantUserRecord | null>
  ) {
    this.verifyTenantPassword = verifyTenantPassword
  }

  async execute(input: TenantUserLoginRequest): Promise<TenantUserLoginResponse> {
    const user = await this.verifyTenantPassword(input.email.trim(), input.password)
    if (!user) {
      throw new Error('Invalid credentials')
    }

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
