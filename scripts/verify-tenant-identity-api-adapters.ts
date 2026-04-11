import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

async function assertUsesHttpAdapter(path: string) {
  const content = await readFile(path, 'utf8')
  assert.equal(content.includes('createTenantIdentityHttpAdapter'), true, `${path} should use HTTP adapter`)
}

async function main() {
  for (const path of [
    'server/api/admin/login.post.ts',
    'server/api/admin/tenants.get.ts',
    'server/api/admin/tenants.post.ts',
    'server/api/admin/tenants/[tenantId].get.ts',
    'server/api/admin/tenants/[tenantId].put.ts',
    'server/api/admin/tenants/[tenantId].delete.ts',
    'server/api/admin/tenants/[tenantId]/restore.post.ts',
    'server/api/admin/tenants/[tenantId]/reset-code.post.ts',
    'server/api/tenant/login.post.ts',
    'server/api/tenant/me.get.ts',
    'server/api/tenant/change-password.post.ts',
    'server/api/tenant/reset-code.post.ts',
    'server/api/tenant/reset-password.post.ts'
  ]) {
    await assertUsesHttpAdapter(path)
  }

  console.log('tenant identity api adapters verified')
}

void main()
