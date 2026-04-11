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
  const packageJson = JSON.parse(await readFile('package.json', 'utf8')) as {
    workspaces?: string[]
    scripts?: Record<string, string>
  }

  assert.deepEqual(packageJson.workspaces, ['services/*', 'packages/*'])
  assert.equal(typeof packageJson.scripts?.['services:list'], 'string')

  for (const path of [
    'services/tenant-identity-service/package.json',
    'services/knowledge-indexing-service/package.json',
    'services/agent-runtime-service/package.json',
    'services/embed-delivery-service/package.json',
    'packages/contracts/package.json',
    'packages/shared-config/package.json'
  ]) {
    assert.equal(await pathExists(path), true, `${path} should exist`)
  }

  console.log('service skeleton verified')
}

void main()
