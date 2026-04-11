import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'

const assetRoot = join(process.cwd(), '.data', 'source-assets')

function sanitizeSegment(value: string): string {
  const trimmed = value.trim()
  const fallback = trimmed || 'asset'

  return fallback.replace(/[^a-zA-Z0-9._-]+/g, '-')
}

export interface SaveTenantAssetInput {
  tenantId: string
  fileName: string
  contents: Buffer
}

export interface StoredTenantAsset {
  fileName: string
  assetPath: string
  relativePath: string
}

export async function saveTenantAsset(input: SaveTenantAssetInput): Promise<StoredTenantAsset> {
  const safeTenantId = sanitizeSegment(input.tenantId)
  const extension = extname(input.fileName)
  const baseName = basename(input.fileName, extension)
  const safeFileName = `${sanitizeSegment(baseName)}${extension || ''}`
  const tenantDir = join(assetRoot, safeTenantId)

  await mkdir(tenantDir, { recursive: true })

  const assetPath = join(tenantDir, safeFileName)
  await writeFile(assetPath, input.contents)

  return {
    fileName: safeFileName,
    assetPath,
    relativePath: join('.data', 'source-assets', safeTenantId, safeFileName)
  }
}

export async function readTenantAsset(assetPath: string): Promise<Buffer> {
  return readFile(assetPath)
}
