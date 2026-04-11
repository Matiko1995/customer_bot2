import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { createFileStore } from '../server/lib/storage/file-store.ts'
import { createDemoTenant, getStorageFilePath } from '../server/lib/demo.ts'
import { DEMO_TENANT_ID } from '../lib/demo-config.ts'
import { buildFastenerTenantContentUpdate } from '../server/lib/industry-packs/fastener-pack.ts'

function nextBackupPath(tenantId: string): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  return resolve(process.cwd(), '.data', 'import-backups', `${tenantId}-before-fastener-pack-${stamp}.json`)
}

async function main() {
  const storageFilePath = getStorageFilePath()
  const store = createFileStore({
    filePath: storageFilePath,
    seedTenants: [createDemoTenant()]
  })

  const tenants = await store.listTenants()
  const businessTenants = tenants.filter((tenant) => tenant.id !== DEMO_TENANT_ID && !tenant.deletedAt)

  if (businessTenants.length !== 1) {
    throw new Error(`Expected exactly one business tenant, found ${businessTenants.length}`)
  }

  const target = businessTenants[0]
  const backupPath = nextBackupPath(target.id)
  await mkdir(dirname(backupPath), { recursive: true })
  await writeFile(backupPath, JSON.stringify(target, null, 2), 'utf8')

  const updated = await buildFastenerTenantContentUpdate(target)
  await store.saveTenant(updated)

  console.log(JSON.stringify({
    ok: true,
    tenantId: updated.id,
    backupPath,
    knowledgeEntries: updated.contentConfig?.knowledgeEntries.length ?? 0,
    products: updated.contentConfig?.products.length ?? 0,
    articles: updated.contentConfig?.articles.length ?? 0,
    contentSources: updated.contentConfig?.contentSources.length ?? 0,
    ragIndustryPreset: updated.ragSettings?.industryPreset,
    ragEnabled: updated.ragSettings?.enabled
  }, null, 2))
}

void main()
