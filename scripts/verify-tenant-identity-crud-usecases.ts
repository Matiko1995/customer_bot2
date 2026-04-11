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
    'services/tenant-identity-service/src/modules/tenants/use-cases/get-tenant.use-case.ts',
    'services/tenant-identity-service/src/modules/tenants/use-cases/list-tenants.use-case.ts',
    'services/tenant-identity-service/src/modules/tenants/use-cases/update-tenant.use-case.ts',
    'services/tenant-identity-service/src/modules/tenant-users/use-cases/list-tenant-users.use-case.ts'
  ]) {
    assert.equal(await pathExists(path), true, `${path} should exist`)
  }

  console.log('tenant identity crud use cases verified')
}

void main()
