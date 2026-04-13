import type { StorageRepository } from '../../../../server/lib/storage/types.ts'
import type { CloudflareRuntimeBindings } from '../../../../server/lib/cloudflare/bindings.ts'
import { createTenantIdentityApplication } from './create-tenant-identity-application.ts'
import { createCloudflareTenantIdentityApplication } from './create-cloudflare-tenant-identity-application.ts'
import { createTenantIdentityHttpLayer } from '../http/routes.ts'

export function createTenantIdentityHttpAdapter(
  input: StorageRepository | { storage?: StorageRepository; bindings?: CloudflareRuntimeBindings }
) {
  const application =
    'saveTenant' in input
      ? createTenantIdentityApplication(input)
      : input.bindings?.TENANT_IDENTITY_DB
        ? createCloudflareTenantIdentityApplication(input.bindings)
        : createTenantIdentityApplication(input.storage as StorageRepository)

  return createTenantIdentityHttpLayer(application)
}
