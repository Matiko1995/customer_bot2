import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

async function assertUsesGatewayHelper(path: string) {
  const content = await readFile(path, 'utf8')
  assert.equal(content.includes('createEmbedDeliveryGatewayForEvent'), true, `${path} should use EmbedDelivery gateway helper`)
}

async function main() {
  await assertUsesGatewayHelper('server/api/embed/config.get.ts')
  await assertUsesGatewayHelper('server/routes/customer-bot.js.get.ts')
  console.log('embed delivery api adapters verified')
}

void main()
