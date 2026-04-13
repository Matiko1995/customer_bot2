import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

async function assertUsesGatewayHelper(path: string) {
  const content = await readFile(path, 'utf8')
  assert.equal(content.includes('createAgentRuntimeGatewayForEvent'), true, `${path} should use AgentRuntime gateway helper`)
}

async function main() {
  await assertUsesGatewayHelper('server/api/chat.post.ts')
  await assertUsesGatewayHelper('server/api/contact.post.ts')
  console.log('agent runtime api adapters verified')
}

void main()
