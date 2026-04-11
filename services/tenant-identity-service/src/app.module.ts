import { AuthModule } from './modules/auth/auth.module.ts'
import { TenantsModule } from './modules/tenants/tenants.module.ts'
import { TenantUsersModule } from './modules/tenant-users/tenant-users.module.ts'

export class TenantIdentityAppModule {
  static readonly modules = [AuthModule, TenantsModule, TenantUsersModule]
}
