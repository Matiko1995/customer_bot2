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
  const path = 'deploy/pm2/ecosystem.config.cjs'
  assert.equal(await pathExists(path), true, `${path} should exist`)

  const content = await readFile(path, 'utf8')
  assert.equal(content.includes('customer-bot-app'), true)
  assert.equal(content.includes('tenant-identity-service'), true)
  assert.equal(content.includes('knowledge-indexing-service'), true)
  assert.equal(content.includes('agent-runtime-service'), true)
  assert.equal(content.includes('embed-delivery-service'), true)
  assert.equal(content.includes('TENANT_IDENTITY_SERVICE_URL'), true)
  assert.equal(content.includes('KNOWLEDGE_INDEXING_SERVICE_URL'), true)
  assert.equal(content.includes('AGENT_RUNTIME_SERVICE_URL'), true)
  assert.equal(content.includes('EMBED_DELIVERY_SERVICE_URL'), true)

  console.log('pm2 ecosystem verified')
}

void main()
