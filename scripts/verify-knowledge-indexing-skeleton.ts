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
    'services/knowledge-indexing-service/src/domain/repositories/knowledge-indexing.repository.ts',
    'services/knowledge-indexing-service/src/knowledge-indexing.application.ts',
    'services/knowledge-indexing-service/src/infrastructure/create-knowledge-indexing-application.ts',
    'services/knowledge-indexing-service/src/infrastructure/create-knowledge-indexing-http-adapter.ts',
    'services/knowledge-indexing-service/src/http/routes.ts',
    'services/knowledge-indexing-service/src/http/controllers/sources.controller.ts',
    'services/knowledge-indexing-service/src/http/controllers/jobs.controller.ts',
    'services/knowledge-indexing-service/src/http/controllers/agent-docs.controller.ts'
  ]) {
    assert.equal(await pathExists(path), true, `${path} should exist`)
  }

  console.log('knowledge indexing skeleton verified')
}

void main()
