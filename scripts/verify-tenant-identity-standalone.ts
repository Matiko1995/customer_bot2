import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function main() {
  assert.equal(await pathExists('services/tenant-identity-service/src/server.ts'), true)
  assert.equal(await pathExists('services/tenant-identity-service/src/http/standalone-routes.ts'), true)

  const routes = await readFile('services/tenant-identity-service/src/http/standalone-routes.ts', 'utf8')
  assert.equal(routes.includes('/health'), true)
  assert.equal(routes.includes('/admin/login'), true)
  assert.equal(routes.includes('/tenants'), true)

  console.log('tenant identity standalone entry verified')
}

void main()
