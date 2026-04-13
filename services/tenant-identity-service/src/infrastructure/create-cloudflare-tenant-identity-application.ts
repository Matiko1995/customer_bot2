import type { CloudflareRuntimeBindings } from '../../../../server/lib/cloudflare/bindings.ts'
import { getCloudflareRuntimeBindings } from '../../../../server/lib/cloudflare/runtime.ts'
import { sendTenantResetEmail } from '../../../../server/lib/mailer.ts'
import { issueTenantPasswordReset, resetTenantPassword, createTenantLoginForTenant, verifyTenantPassword } from '../../../../server/lib/tenant-users.ts'
import { validateAdminCredentials } from '../../../../server/lib/auth.ts'
import { TenantIdentityApplication } from '../tenant-identity.application.ts'
import { StorageTenantIdentityRepositoryAdapter } from './storage-tenant-identity.repository.ts'
import { D1TenantIdentityStorageRepository } from './d1-tenant-identity-storage.repository.ts'

export function createCloudflareTenantIdentityStorage(bindings?: CloudflareRuntimeBindings) {
  const runtimeBindings = getCloudflareRuntimeBindings(bindings)
  if (!runtimeBindings?.TENANT_IDENTITY_DB) {
    throw new Error('TENANT_IDENTITY_DB binding is required')
  }

  return new D1TenantIdentityStorageRepository(runtimeBindings.TENANT_IDENTITY_DB)
}

export function createCloudflareTenantIdentityApplication(bindings?: CloudflareRuntimeBindings) {
  const storage = createCloudflareTenantIdentityStorage(bindings)
  const repository = new StorageTenantIdentityRepositoryAdapter(storage)

  return new TenantIdentityApplication({
    repository,
    validateAdminCredentials,
    createTenantLogin: ({ tenant, now }) =>
      createTenantLoginForTenant({
        tenant,
        storage,
        now
      }),
    verifyTenantPassword: (email, password) => verifyTenantPassword(email, password, storage),
    issueTenantPasswordReset: ({ email }) =>
      issueTenantPasswordReset({
        email,
        storage
      }),
    resetTenantPassword: (input) =>
      resetTenantPassword({
        ...input,
        storage
      }),
    sendTenantResetEmail
  })
}
