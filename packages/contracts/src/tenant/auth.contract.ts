export interface AdminLoginRequest {
  email: string
  password: string
}

export interface AdminLoginResponse {
  ok: true
}

export interface TenantUserLoginRequest {
  email: string
  password: string
}

export interface TenantUserLoginResponse {
  ok: true
  user: {
    tenantUserId: string
    email: string
    tenantId: string
    mustChangePassword: boolean
  }
}

export interface TenantSessionPayload {
  tenantUserId: string
  tenantId: string
  email: string
}

export interface ChangeTenantPasswordRequest {
  currentPassword: string
  nextPassword: string
}

export interface BasicOkResponse {
  ok: true
}

export interface TenantResetCodeResponse {
  ok: true
  item: {
    email: string
    expiresAt: number
    provider: string
    previewCode?: string
  }
}

export interface TenantResetPasswordRequest {
  email: string
  code: string
  nextPassword: string
}
