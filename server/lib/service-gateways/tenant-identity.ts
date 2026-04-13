import type {
  AdminLoginRequest,
  AdminLoginResponse,
  TenantUserLoginRequest,
  TenantUserLoginResponse,
  ChangeTenantPasswordRequest,
  TenantResetPasswordRequest,
  TenantResetCodeResponse
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
import { getServiceBaseUrl } from '../../../packages/shared-config/src/service-endpoints.ts'
import { createTenantIdentityHttpAdapter } from '../../../services/tenant-identity-service/src/infrastructure/create-tenant-identity-http-adapter.ts'
import type { CloudflareRuntimeBindings } from '../cloudflare/bindings.ts'
import { requestJson, type GatewayHttpOptions } from './http.ts'
import type { StorageRepository } from '../storage/types.ts'

export function createTenantIdentityGateway(
  input:
    | StorageRepository
    | ({ storage?: StorageRepository; bindings?: CloudflareRuntimeBindings } & GatewayHttpOptions)
) {
  const storage = 'saveTenant' in input ? input : input.storage
  const bindings = 'saveTenant' in input ? undefined : input.bindings
  const baseUrl = 'saveTenant' in input ? getServiceBaseUrl('tenant-identity-service') : input.baseUrl || getServiceBaseUrl('tenant-identity-service')
  const fetcher = 'saveTenant' in input ? undefined : input.fetcher
  const http = 'saveTenant' in input
    ? createTenantIdentityHttpAdapter(input)
    : createTenantIdentityHttpAdapter({ storage, bindings })

  return {
    adminLogin(input: AdminLoginRequest): Promise<AdminLoginResponse> | AdminLoginResponse {
      if (baseUrl) {
        return requestJson<AdminLoginResponse>({
          baseUrl,
          path: '/admin/login',
          method: 'POST',
          body: input,
          fetcher
        })
      }

      return http.adminAuth.login(input)
    },
    listTenants(input?: { includeDeleted?: boolean }): Promise<ListTenantsResponse> {
      if (baseUrl) {
        const suffix = input?.includeDeleted ? '?includeDeleted=1' : ''
        return requestJson<ListTenantsResponse>({
          baseUrl,
          path: `/tenants${suffix}`,
          fetcher
        })
      }

      return http.tenants.list(input)
    },
    createTenant(input: CreateTenantRequest & Record<string, unknown>): Promise<CreateTenantResponse> {
      if (baseUrl) {
        return requestJson<CreateTenantResponse>({
          baseUrl,
          path: '/tenants',
          method: 'POST',
          body: input,
          fetcher
        })
      }

      return http.tenants.create(input)
    },
    getTenant(tenantId: string): Promise<GetTenantResponse> {
      if (baseUrl) {
        return requestJson<GetTenantResponse>({
          baseUrl,
          path: `/tenants/${encodeURIComponent(tenantId)}`,
          fetcher
        })
      }

      return http.tenants.get(tenantId)
    },
    updateTenant(tenantId: string, input: UpdateTenantRequest & Record<string, unknown>): Promise<UpdateTenantResponse> {
      if (baseUrl) {
        return requestJson<UpdateTenantResponse>({
          baseUrl,
          path: `/tenants/${encodeURIComponent(tenantId)}`,
          method: 'PUT',
          body: input,
          fetcher
        })
      }

      return http.tenants.update(tenantId, input)
    },
    deleteTenant(tenantId: string) {
      if (baseUrl) {
        return requestJson({
          baseUrl,
          path: `/tenants/${encodeURIComponent(tenantId)}`,
          method: 'DELETE',
          fetcher
        })
      }

      return http.tenants.delete(tenantId)
    },
    restoreTenant(tenantId: string) {
      if (baseUrl) {
        return requestJson({
          baseUrl,
          path: `/tenants/${encodeURIComponent(tenantId)}/restore`,
          method: 'POST',
          fetcher
        })
      }

      return http.tenants.restore(tenantId)
    },
    issueTenantResetCode(input: { tenantId: string; loginUrl: string }): Promise<TenantResetCodeResponse> {
      if (baseUrl) {
        return requestJson<TenantResetCodeResponse>({
          baseUrl,
          path: `/tenants/${encodeURIComponent(input.tenantId)}/reset-code`,
          method: 'POST',
          body: { loginUrl: input.loginUrl },
          fetcher
        })
      }

      return http.tenants.issueResetCode(input)
    },
    tenantUserLogin(input: TenantUserLoginRequest): Promise<TenantUserLoginResponse> {
      if (baseUrl) {
        return requestJson<TenantUserLoginResponse>({
          baseUrl,
          path: '/tenant-users/login',
          method: 'POST',
          body: input,
          fetcher
        })
      }

      return http.tenantUsers.login(input)
    },
    tenantMe(input: { tenantUserId: string; tenantId: string }): Promise<TenantMeResponse> {
      if (baseUrl) {
        return requestJson<TenantMeResponse>({
          baseUrl,
          path: '/tenant-users/me',
          method: 'POST',
          body: input,
          fetcher
        })
      }

      return http.tenantUsers.me(input)
    },
    changeTenantPassword(input: { tenantUserId: string; tenantId: string; email: string } & ChangeTenantPasswordRequest) {
      if (baseUrl) {
        return requestJson({
          baseUrl,
          path: '/tenant-users/change-password',
          method: 'POST',
          body: input,
          fetcher
        })
      }

      return http.tenantUsers.changePassword(input)
    },
    issueTenantUserResetCode(input: { tenantId: string; email: string; loginUrl: string }) {
      if (baseUrl) {
        return requestJson<TenantResetCodeResponse>({
          baseUrl,
          path: '/tenant-users/reset-code',
          method: 'POST',
          body: input,
          fetcher
        })
      }

      return http.tenantUsers.issueResetCode(input)
    },
    resetTenantPassword(input: TenantResetPasswordRequest) {
      if (baseUrl) {
        return requestJson<TenantUserLoginResponse>({
          baseUrl,
          path: '/tenant-users/reset-password',
          method: 'POST',
          body: input,
          fetcher
        })
      }

      return http.tenantUsers.resetPassword(input)
    }
  }
}
