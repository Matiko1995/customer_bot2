import type { TenantIdentityApplication } from '../tenant-identity.application.ts'
import { AdminAuthController } from './controllers/admin-auth.controller.ts'
import { TenantsController } from './controllers/tenants.controller.ts'
import { TenantUsersController } from './controllers/tenant-users.controller.ts'

export function createTenantIdentityHttpLayer(application: TenantIdentityApplication) {
  return {
    adminAuth: new AdminAuthController(application),
    tenants: new TenantsController(application),
    tenantUsers: new TenantUsersController(application)
  }
}
