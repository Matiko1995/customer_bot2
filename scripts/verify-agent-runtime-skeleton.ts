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
    'services/agent-runtime-service/src/agent-runtime.application.ts',
    'services/agent-runtime-service/src/infrastructure/create-agent-runtime-application.ts',
    'services/agent-runtime-service/src/infrastructure/create-agent-runtime-http-adapter.ts',
    'services/agent-runtime-service/src/http/routes.ts',
    'services/agent-runtime-service/src/http/controllers/chat.controller.ts',
    'services/agent-runtime-service/src/http/controllers/contact.controller.ts',
    'packages/contracts/src/agent/chat.contract.ts',
    'packages/contracts/src/agent/contact.contract.ts'
  ]) {
    assert.equal(await pathExists(path), true, `${path} should exist`)
  }

  console.log('agent runtime skeleton verified')
}

void main()
