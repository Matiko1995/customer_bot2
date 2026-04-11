import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

async function assertUsesHttpAdapter(path: string) {
  const content = await readFile(path, 'utf8')
  assert.equal(content.includes('createKnowledgeIndexingGateway'), true, `${path} should use KnowledgeIndexing gateway`)
}

async function main() {
  for (const path of [
    'server/api/admin/tenants/[tenantId]/sources.get.ts',
    'server/api/admin/tenants/[tenantId]/sources.post.ts',
    'server/api/admin/tenants/[tenantId]/sources/[sourceId].put.ts',
    'server/api/admin/tenants/[tenantId]/sources/[sourceId]/upload.post.ts',
    'server/api/admin/tenants/[tenantId]/jobs.get.ts',
    'server/api/admin/tenants/[tenantId]/agent-docs.get.ts',
    'server/api/admin/tenants/[tenantId]/sources/[sourceId]/sync.post.ts',
    'server/api/admin/tenants/[tenantId]/jobs/[jobId]/retry.post.ts',
    'server/api/admin/tenants/[tenantId]/agent-docs/[fileName].put.ts'
  ]) {
    await assertUsesHttpAdapter(path)
  }

  console.log('knowledge indexing api adapters verified')
}

void main()
