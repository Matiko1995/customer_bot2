import type { H3Event } from 'h3'
import { getCloudflareRuntimeBindings } from '../cloudflare/runtime.ts'
import { createTenantIdentityGateway } from './tenant-identity.ts'
import { getStorage } from '../storage/index.ts'
import { createCloudflareTenantIdentityStorage } from '../../../services/tenant-identity-service/src/infrastructure/create-cloudflare-tenant-identity-application.ts'

export function createTenantIdentityGatewayForEvent(event: H3Event) {
  const bindings = getCloudflareRuntimeBindings(event.context as { cloudflare?: { env?: unknown } })
  return createTenantIdentityGateway({
    storage: getStorage(),
    bindings
  })
}

export function createTenantIdentityStorageForEvent(event: H3Event) {
  const bindings = getCloudflareRuntimeBindings(event.context as { cloudflare?: { env?: unknown } })
  if (bindings?.TENANT_IDENTITY_DB) {
    return createCloudflareTenantIdentityStorage(bindings)
  }

  return getStorage()
}
