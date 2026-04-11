import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

async function assertUsesHttpAdapter(path: string) {
  const content = await readFile(path, 'utf8')
  assert.equal(content.includes('createEmbedDeliveryGateway'), true, `${path} should use EmbedDelivery gateway`)
}

async function main() {
  await assertUsesHttpAdapter('server/api/embed/config.get.ts')
  await assertUsesHttpAdapter('server/routes/customer-bot.js.get.ts')
  console.log('embed delivery api adapters verified')
}

void main()
