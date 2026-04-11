import type { AdminLoginRequest, AdminLoginResponse } from '../../../../../packages/contracts/src/tenant/auth.contract'
import type { TenantIdentityApplication } from '../../tenant-identity.application.ts'

export class AdminAuthController {
  private readonly application: TenantIdentityApplication

  constructor(application: TenantIdentityApplication) {
    this.application = application
  }

  login(input: AdminLoginRequest): AdminLoginResponse {
    return this.application.adminLogin(input)
  }
}
