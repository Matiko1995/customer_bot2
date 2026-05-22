export interface TenantUserRecordContract {
  id: string
  tenantId: string
  email: string
  displayName?: string
  seatRole?: 'owner' | 'agent'
  mustChangePassword: boolean
  status: 'active' | 'disabled'
  createdAt: number
  updatedAt: number
}

export interface ListTenantUsersResponse {
  items: TenantUserRecordContract[]
}

export interface TenantMeResponse {
  user: TenantUserRecordContract
  tenant: {
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
    createdAt: number
    updatedAt: number
  }
}
