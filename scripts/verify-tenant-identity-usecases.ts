import assert from 'node:assert/strict'
import { access } from 'node:fs/promises'

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function main() {
  for (const path of [
    'services/tenant-identity-service/src/domain/repositories/tenant-identity.repository.ts',
    'services/tenant-identity-service/src/modules/auth/use-cases/admin-login.use-case.ts',
    'services/tenant-identity-service/src/modules/tenants/use-cases/create-tenant.use-case.ts',
    'services/tenant-identity-service/src/modules/tenant-users/use-cases/tenant-user-login.use-case.ts'
  ]) {
    assert.equal(await pathExists(path), true, `${path} should exist`)
  }

  console.log('tenant identity use cases verified')
}

void main()
