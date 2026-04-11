import type { StorageRepository } from '../../../../server/lib/storage/types.ts'
import { createTenantIdentityApplication } from './create-tenant-identity-application.ts'
import { createTenantIdentityHttpLayer } from '../http/routes.ts'

export function createTenantIdentityHttpAdapter(storage: StorageRepository) {
  const application = createTenantIdentityApplication(storage)
  return createTenantIdentityHttpLayer(application)
}
