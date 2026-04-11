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
    'services/tenant-identity-service/src/http/routes.ts',
    'services/tenant-identity-service/src/http/controllers/admin-auth.controller.ts',
    'services/tenant-identity-service/src/http/controllers/tenants.controller.ts',
    'services/tenant-identity-service/src/http/controllers/tenant-users.controller.ts'
  ]) {
    assert.equal(await pathExists(path), true, `${path} should exist`)
  }

  console.log('tenant identity http entry verified')
}

void main()
