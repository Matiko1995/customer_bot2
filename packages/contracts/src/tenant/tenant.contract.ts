import type { TenantRagSettings } from '../../../shared-config/src/rag-settings.ts'

export interface TenantIdentityRecord {
  id: string
  name: string
  status: 'active' | 'disabled'
  brandName: string
  themeColor: string
  contactPhone: string
  contactEmail: string
  contactAddress: string
  systemPrompt: string
  embedKey: string
  ragSettings?: TenantRagSettings
  createdAt: number
  updatedAt: number
}

export interface CreateTenantRequest {
  id?: string
  name?: string
  status?: 'active' | 'disabled'
  brandName?: string
  themeColor?: string
  contactPhone?: string
  contactEmail?: string
  contactAddress?: string
  systemPrompt?: string
  embedKey?: string
  ragSettings?: Partial<TenantRagSettings>
}

export interface CreateTenantResponse {
  ok: true
  item: TenantIdentityRecord
  tenantLogin: {
    email: string
    initialPassword: string
    mustChangePassword: boolean
  }
}

export interface ListTenantsResponse {
  items: TenantIdentityRecord[]
}

export interface GetTenantResponse {
  item: TenantIdentityRecord
  tenantUsers: Array<{
    id: string
    tenantId: string
    email: string
    mustChangePassword: boolean
    status: 'active' | 'disabled'
    createdAt: number
    updatedAt: number
  }>
}

export interface UpdateTenantRequest extends Partial<CreateTenantRequest> {
  reuseAnsweredQuestions?: boolean
  ragSettings?: Partial<TenantRagSettings>
}

export interface UpdateTenantResponse {
  ok: true
  item: TenantIdentityRecord
}
