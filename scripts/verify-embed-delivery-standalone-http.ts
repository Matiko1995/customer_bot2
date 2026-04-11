import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { createServer } from 'node:http'
import { createMemoryStore } from '../server/lib/storage/memory-store.ts'
import { createEmbedDeliveryApplication } from '../services/embed-delivery-service/src/infrastructure/create-embed-delivery-application.ts'
import { createEmbedDeliveryStandaloneHandler } from '../services/embed-delivery-service/src/http/standalone-routes.ts'

async function ensureWidgetScriptFixture() {
  const path = 'dist/customer-bot.js'
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, 'window.CustomerBot = { init() {} }', 'utf8')
}

async function request(path: string) {
  const response = await fetch(`http://127.0.0.1:3314${path}`)
  return {
    status: response.status,
    text: await response.text(),
    contentType: response.headers.get('content-type') || ''
  }
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

  const application = createEmbedDeliveryApplication(storage)
  const handler = createEmbedDeliveryStandaloneHandler(application)
  const server = createServer((req, res) => {
    void handler(req, res)
  })

  await new Promise<void>((resolve) => server.listen(3314, '127.0.0.1', resolve))

  try {
    const health = await request('/health')
    assert.equal(health.status, 200)

    const config = await request('/embed/runtime-config?tenantId=tenant-1')
    assert.equal(config.status, 200)
    assert.equal(config.text.includes('Tenant Bot'), true)

    const script = await request('/embed/widget-script')
    assert.equal(script.status, 200)
    assert.equal(script.contentType.includes('javascript'), true)
    assert.equal(script.text.includes('CustomerBot'), true)

    console.log('embed delivery standalone http verified')
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  }
}

void main()
