import { sendTenantResetEmail } from '../../../../server/lib/mailer.ts'
import { issueTenantPasswordReset, resetTenantPassword } from '../../../../server/lib/tenant-users.ts'
import { createTenantLoginForTenant, verifyTenantPassword } from '../../../../server/lib/tenant-users.ts'
import { validateAdminCredentials } from '../../../../server/lib/auth.ts'
import type { StorageRepository } from '../../../../server/lib/storage/types.ts'
import { StorageTenantIdentityRepositoryAdapter } from './storage-tenant-identity.repository.ts'
import { TenantIdentityApplication } from '../tenant-identity.application.ts'

export function createTenantIdentityApplication(storage: StorageRepository) {
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
