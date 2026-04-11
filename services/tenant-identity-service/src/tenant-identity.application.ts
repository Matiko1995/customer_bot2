import type {
  AdminLoginRequest,
  AdminLoginResponse,
  BasicOkResponse,
  ChangeTenantPasswordRequest,
  TenantResetCodeResponse,
  TenantResetPasswordRequest,
  TenantUserLoginRequest,
  TenantUserLoginResponse
} from '../../../packages/contracts/src/tenant/auth.contract'
import type {
  CreateTenantRequest,
  CreateTenantResponse,
  GetTenantResponse,
  ListTenantsResponse,
  UpdateTenantRequest,
  UpdateTenantResponse
} from '../../../packages/contracts/src/tenant/tenant.contract'
import type { TenantMeResponse } from '../../../packages/contracts/src/tenant/tenant-user.contract'
import type { TenantRecord, TenantUserRecord } from '../../../types'
import { AdminLoginUseCase } from './modules/auth/use-cases/admin-login.use-case.ts'
import { GetTenantUseCase } from './modules/tenants/use-cases/get-tenant.use-case.ts'
import { ListTenantsUseCase } from './modules/tenants/use-cases/list-tenants.use-case.ts'
import { UpdateTenantUseCase } from './modules/tenants/use-cases/update-tenant.use-case.ts'
import { CreateTenantUseCase } from './modules/tenants/use-cases/create-tenant.use-case.ts'
import { DeleteTenantUseCase } from './modules/tenants/use-cases/delete-tenant.use-case.ts'
import { RestoreTenantUseCase } from './modules/tenants/use-cases/restore-tenant.use-case.ts'
import { ChangeTenantPasswordUseCase, ResetTenantPasswordUseCase } from './modules/tenant-users/use-cases/change-tenant-password.use-case.ts'
import { IssueTenantResetCodeUseCase } from './modules/tenant-users/use-cases/issue-tenant-reset-code.use-case.ts'
import { GetTenantMeUseCase, ListTenantUsersUseCase } from './modules/tenant-users/use-cases/list-tenant-users.use-case.ts'
import { TenantUserLoginUseCase } from './modules/tenant-users/use-cases/tenant-user-login.use-case.ts'
import type { TenantIdentityRepository } from './domain/repositories/tenant-identity.repository'

export interface TenantIdentityApplicationDependencies {
  repository: TenantIdentityRepository
  validateAdminCredentials: (email: string, password: string) => boolean
  createTenantLogin: (input: { tenant: TenantRecord; now?: number }) => Promise<{
    user: { email: string; mustChangePassword: boolean }
    initialPassword: string
  }>
  verifyTenantPassword: (email: string, password: string) => Promise<TenantUserRecord | null>
  issueTenantPasswordReset: (input: { email: string }) => Promise<{ email: string; code: string; expiresAt: number; tenantId: string }>
  resetTenantPassword: (input: TenantResetPasswordRequest) => Promise<{
    id: string
    email: string
    tenantId: string
    mustChangePassword: boolean
  }>
  sendTenantResetEmail: (input: {
    to: string
    code: string
    expiresAt: number
    tenantName: string
    loginUrl: string
  }) => Promise<{ provider: string; previewCode?: string }>
}

export class TenantIdentityApplication {
  private readonly deps: TenantIdentityApplicationDependencies

  constructor(deps: TenantIdentityApplicationDependencies) {
    this.deps = deps
  }

  adminLogin(input: AdminLoginRequest): AdminLoginResponse {
    return new AdminLoginUseCase(this.deps.validateAdminCredentials).execute(input)
  }

  createTenant(input: CreateTenantRequest & Partial<TenantRecord>): Promise<CreateTenantResponse> {
    return new CreateTenantUseCase(this.deps.repository, this.deps.createTenantLogin).execute(input)
  }

  listTenants(input?: { includeDeleted?: boolean }): Promise<ListTenantsResponse> {
    return new ListTenantsUseCase(this.deps.repository).execute(input)
  }

  getTenant(tenantId: string): Promise<GetTenantResponse> {
    return new GetTenantUseCase(this.deps.repository).execute(tenantId)
  }

  updateTenant(tenantId: string, input: UpdateTenantRequest & Partial<TenantRecord>): Promise<UpdateTenantResponse> {
    return new UpdateTenantUseCase(this.deps.repository).execute(tenantId, input)
  }

  deleteTenant(tenantId: string): Promise<BasicOkResponse> {
    return new DeleteTenantUseCase(this.deps.repository).execute(tenantId)
  }

  restoreTenant(tenantId: string): Promise<BasicOkResponse> {
    return new RestoreTenantUseCase(this.deps.repository).execute(tenantId)
  }

  async tenantUserLogin(input: TenantUserLoginRequest): Promise<TenantUserLoginResponse> {
    return new TenantUserLoginUseCase(this.deps.verifyTenantPassword).execute(input)
  }

  getTenantMe(input: { tenantUserId: string; tenantId: string }): Promise<TenantMeResponse> {
    return new GetTenantMeUseCase(this.deps.repository).execute(input)
  }

  listTenantUsers(tenantId: string) {
    return new ListTenantUsersUseCase(this.deps.repository).execute(tenantId)
  }

  issueTenantResetCode(input: {
    tenantId: string
    email?: string
    loginUrl: string
  }): Promise<TenantResetCodeResponse> {
    return new IssueTenantResetCodeUseCase(
      this.deps.repository,
      this.deps.issueTenantPasswordReset,
      this.deps.sendTenantResetEmail
    ).execute(input)
  }

  changeTenantPassword(input: {
    tenantUserId: string
    tenantId: string
    email: string
  } & ChangeTenantPasswordRequest): Promise<BasicOkResponse> {
    return new ChangeTenantPasswordUseCase(
      this.deps.repository,
      this.deps.verifyTenantPassword
    ).execute(input)
  }

  resetTenantPassword(input: TenantResetPasswordRequest) {
    return new ResetTenantPasswordUseCase(this.deps.resetTenantPassword).execute(input)
  }
}
