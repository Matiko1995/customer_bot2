import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

async function main() {
  const appEntry = await readFile('services/tenant-identity-service/src/tenant-identity.application.ts', 'utf8')
  assert.equal(appEntry.includes('class TenantIdentityApplication'), true)

  const adminLogin = await readFile('server/api/admin/login.post.ts', 'utf8')
  const tenantCreate = await readFile('server/api/admin/tenants.post.ts', 'utf8')
  const tenantMe = await readFile('server/api/tenant/me.get.ts', 'utf8')

  assert.equal(adminLogin.includes('TenantIdentityApplication'), true)
  assert.equal(tenantCreate.includes('TenantIdentityApplication'), true)
  assert.equal(tenantMe.includes('TenantIdentityApplication'), true)

  console.log('tenant identity application verified')
}

void main()
