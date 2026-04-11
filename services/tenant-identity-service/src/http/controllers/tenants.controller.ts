import type {
  CreateTenantRequest,
  CreateTenantResponse,
  GetTenantResponse,
  ListTenantsResponse,
  UpdateTenantRequest,
  UpdateTenantResponse
} from '../../../../../packages/contracts/src/tenant/tenant.contract'
import type { TenantRecord } from '../../../../../types'
import type { TenantIdentityApplication } from '../../tenant-identity.application.ts'

export class TenantsController {
  private readonly application: TenantIdentityApplication

  constructor(application: TenantIdentityApplication) {
    this.application = application
  }

  list(input?: { includeDeleted?: boolean }): Promise<ListTenantsResponse> {
    return this.application.listTenants(input)
  }

  create(input: CreateTenantRequest & Partial<TenantRecord>): Promise<CreateTenantResponse> {
    return this.application.createTenant(input)
  }

  get(tenantId: string): Promise<GetTenantResponse> {
    return this.application.getTenant(tenantId)
  }

  update(tenantId: string, input: UpdateTenantRequest & Partial<TenantRecord>): Promise<UpdateTenantResponse> {
    return this.application.updateTenant(tenantId, input)
  }

  delete(tenantId: string) {
    return this.application.deleteTenant(tenantId)
  }

  restore(tenantId: string) {
    return this.application.restoreTenant(tenantId)
  }

  issueResetCode(input: { tenantId: string; loginUrl: string }) {
    return this.application.issueTenantResetCode(input)
  }
}
