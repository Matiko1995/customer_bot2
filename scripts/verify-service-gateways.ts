import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

async function assertUsesGateway(path: string, marker: string) {
  const content = await readFile(path, 'utf8')
  assert.equal(content.includes(marker), true, `${path} should use ${marker}`)
}

async function main() {
  await assertUsesGateway('server/api/admin/login.post.ts', 'createTenantIdentityGateway')
  await assertUsesGateway('server/api/admin/tenants.get.ts', 'createTenantIdentityGateway')
  await assertUsesGateway('server/api/admin/tenants.post.ts', 'createTenantIdentityGateway')
  await assertUsesGateway('server/api/admin/tenants/[tenantId].get.ts', 'createTenantIdentityGateway')
  await assertUsesGateway('server/api/admin/tenants/[tenantId].put.ts', 'createTenantIdentityGateway')
  await assertUsesGateway('server/api/admin/tenants/[tenantId].delete.ts', 'createTenantIdentityGateway')
  await assertUsesGateway('server/api/admin/tenants/[tenantId]/restore.post.ts', 'createTenantIdentityGateway')
  await assertUsesGateway('server/api/admin/tenants/[tenantId]/reset-code.post.ts', 'createTenantIdentityGateway')
  await assertUsesGateway('server/api/tenant/login.post.ts', 'createTenantIdentityGateway')
  await assertUsesGateway('server/api/tenant/me.get.ts', 'createTenantIdentityGateway')
  await assertUsesGateway('server/api/tenant/change-password.post.ts', 'createTenantIdentityGateway')
  await assertUsesGateway('server/api/tenant/reset-code.post.ts', 'createTenantIdentityGateway')
  await assertUsesGateway('server/api/tenant/reset-password.post.ts', 'createTenantIdentityGateway')

  await assertUsesGateway('server/api/admin/tenants/[tenantId]/sources.get.ts', 'createKnowledgeIndexingGateway')
  await assertUsesGateway('server/api/admin/tenants/[tenantId]/sources.post.ts', 'createKnowledgeIndexingGateway')
  await assertUsesGateway('server/api/admin/tenants/[tenantId]/sources/[sourceId].delete.ts', 'createKnowledgeIndexingGateway')
  await assertUsesGateway('server/api/admin/tenants/[tenantId]/sources/[sourceId]/sync.post.ts', 'createKnowledgeIndexingGateway')
  await assertUsesGateway('server/api/admin/tenants/[tenantId]/jobs.get.ts', 'createKnowledgeIndexingGateway')
  await assertUsesGateway('server/api/admin/tenants/[tenantId]/jobs/[jobId]/retry.post.ts', 'createKnowledgeIndexingGateway')
  await assertUsesGateway('server/api/admin/tenants/[tenantId]/agent-docs.get.ts', 'createKnowledgeIndexingGateway')
  await assertUsesGateway('server/api/admin/tenants/[tenantId]/agent-docs/[fileName].put.ts', 'createKnowledgeIndexingGateway')

  await assertUsesGateway('server/api/chat.post.ts', 'createAgentRuntimeGateway')
  await assertUsesGateway('server/api/contact.post.ts', 'createAgentRuntimeGateway')

  await assertUsesGateway('server/api/embed/config.get.ts', 'createEmbedDeliveryGateway')
  await assertUsesGateway('server/routes/customer-bot.js.get.ts', 'createEmbedDeliveryGateway')
  console.log('service gateways verified')
}

void main()
