import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

async function main() {
  const packageJson = JSON.parse(await readFile('package.json', 'utf8')) as {
    scripts?: Record<string, string>
  }

  assert.equal(typeof packageJson.scripts?.['stack:dev'], 'string')
  assert.equal(typeof packageJson.scripts?.['stack:dry-run'], 'string')
  assert.equal(typeof packageJson.scripts?.['app:dev'], 'string')

  const launcher = await readFile('scripts/run-local-stack.ps1', 'utf8')
  assert.equal(launcher.includes('service:tenant-identity'), true)
  assert.equal(launcher.includes('service:knowledge-indexing'), true)
  assert.equal(launcher.includes('service:agent-runtime'), true)
  assert.equal(launcher.includes('service:embed-delivery'), true)
  assert.equal(launcher.includes('app:dev'), true)
  assert.equal(launcher.includes('TENANT_IDENTITY_SERVICE_URL'), true)
  assert.equal(launcher.includes('KNOWLEDGE_INDEXING_SERVICE_URL'), true)
  assert.equal(launcher.includes('AGENT_RUNTIME_SERVICE_URL'), true)
  assert.equal(launcher.includes('EMBED_DELIVERY_SERVICE_URL'), true)

  console.log('stack launcher verified')
}

void main()
