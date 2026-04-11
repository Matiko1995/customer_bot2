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
    'services/tenant-identity-service/src/modules/auth',
    'services/tenant-identity-service/src/modules/tenants',
    'services/tenant-identity-service/src/modules/tenant-users',
    'packages/contracts/src/tenant/auth.contract.ts',
    'packages/contracts/src/tenant/tenant.contract.ts',
    'packages/contracts/src/tenant/tenant-user.contract.ts'
  ]) {
    assert.equal(await pathExists(path), true, `${path} should exist`)
  }

  console.log('tenant identity skeleton verified')
}

void main()
