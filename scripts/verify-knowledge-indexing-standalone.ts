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
  assert.equal(await pathExists('services/knowledge-indexing-service/src/server.ts'), true)
  assert.equal(await pathExists('services/knowledge-indexing-service/src/http/standalone-routes.ts'), true)

  const routes = await readFile('services/knowledge-indexing-service/src/http/standalone-routes.ts', 'utf8')
  assert.equal(routes.includes('/health'), true)
  assert.equal(routes.includes('/sources'), true)
  assert.equal(routes.includes('/jobs'), true)
  assert.equal(routes.includes('/agent-docs'), true)

  console.log('knowledge indexing standalone entry verified')
}

void main()
