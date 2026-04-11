import type {
  ChangeTenantPasswordRequest,
  TenantUserLoginRequest,
  TenantUserLoginResponse,
  TenantResetPasswordRequest
} from '../../../../../packages/contracts/src/tenant/auth.contract'
import type { TenantMeResponse } from '../../../../../packages/contracts/src/tenant/tenant-user.contract'
import type { TenantIdentityApplication } from '../../tenant-identity.application.ts'

export class TenantUsersController {
  private readonly application: TenantIdentityApplication

  constructor(application: TenantIdentityApplication) {
    this.application = application
  }

  login(input: TenantUserLoginRequest): Promise<TenantUserLoginResponse> {
    return this.application.tenantUserLogin(input)
  }

  me(input: { tenantUserId: string; tenantId: string }): Promise<TenantMeResponse> {
    return this.application.getTenantMe(input)
  }

  changePassword(input: {
    tenantUserId: string
    tenantId: string
    email: string
  } & ChangeTenantPasswordRequest) {
    return this.application.changeTenantPassword(input)
  }

  issueResetCode(input: { tenantId: string; email: string; loginUrl: string }) {
    return this.application.issueTenantResetCode(input)
  }

  resetPassword(input: TenantResetPasswordRequest) {
    return this.application.resetTenantPassword(input)
  }
}
