import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

async function assertUsesHttpAdapter(path: string) {
  const content = await readFile(path, 'utf8')
  assert.equal(content.includes('createAgentRuntimeGateway'), true, `${path} should use AgentRuntime gateway`)
}

async function main() {
  await assertUsesHttpAdapter('server/api/chat.post.ts')
  await assertUsesHttpAdapter('server/api/contact.post.ts')
  console.log('agent runtime api adapters verified')
}

void main()
