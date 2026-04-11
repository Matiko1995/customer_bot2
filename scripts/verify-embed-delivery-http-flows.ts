import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { createMemoryStore } from '../server/lib/storage/memory-store.ts'
import { createEmbedDeliveryHttpAdapter } from '../services/embed-delivery-service/src/infrastructure/create-embed-delivery-http-adapter.ts'

async function ensureWidgetScriptFixture() {
  const path = 'dist/customer-bot.js'
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, 'window.CustomerBot = { init() {} }', 'utf8')
}

async function main() {
  const storage = createMemoryStore()
  await storage.saveTenant({
    id: 'tenant-1',
    name: 'Tenant 1',
    status: 'active',
    brandName: 'Tenant Bot',
    themeColor: '#118ab2',
    contactPhone: '13800000000',
    contactEmail: 'tenant@example.com',
    contactAddress: 'Shanghai',
    systemPrompt: 'You are the tenant bot.',
    embedKey: 'embed-tenant-1',
    createdAt: 1,
    updatedAt: 1
  })

  await ensureWidgetScriptFixture()
  const http = createEmbedDeliveryHttpAdapter(storage)

  const config = await http.embedConfig.execute({ tenantId: 'tenant-1' })
  assert.equal(config.tenantId, 'tenant-1')
  assert.equal(config.brandName, 'Tenant Bot')

  const script = await http.widgetScript.execute()
  assert.equal(script.contentType.includes('javascript'), true)
  assert.equal(script.code.includes('CustomerBot'), true)

  console.log('embed delivery http layer verified')
}

void main()
