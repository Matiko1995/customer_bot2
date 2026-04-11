import assert from 'node:assert/strict'
import { access } from 'node:fs/promises'

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function main() {
  for (const path of [
    'services/embed-delivery-service/src/embed-delivery.application.ts',
    'services/embed-delivery-service/src/infrastructure/create-embed-delivery-application.ts',
    'services/embed-delivery-service/src/infrastructure/create-embed-delivery-http-adapter.ts',
    'services/embed-delivery-service/src/http/routes.ts',
    'services/embed-delivery-service/src/http/controllers/embed-config.controller.ts',
    'services/embed-delivery-service/src/http/controllers/widget-script.controller.ts',
    'packages/contracts/src/embed/runtime-config.contract.ts',
    'packages/contracts/src/embed/widget-script.contract.ts'
  ]) {
    assert.equal(await pathExists(path), true, `${path} should exist`)
  }

  console.log('embed delivery skeleton verified')
}

void main()
