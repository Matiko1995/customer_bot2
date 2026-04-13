import { basename, extname, join } from 'node:path'
import { getObjectStorageProvider, type ObjectStorageProvider } from '../object-storage/object-storage.ts'

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

function buildAssetKey(input: { tenantId: string; fileName: string }): string {
  const safeTenantId = sanitizeSegment(input.tenantId)
  const extension = extname(input.fileName)
  const baseName = basename(input.fileName, extension)
  const safeFileName = `${sanitizeSegment(baseName)}${extension || ''}`
  return join('source-assets', safeTenantId, safeFileName).replace(/\\/g, '/')
}

export async function saveTenantAsset(
  input: SaveTenantAssetInput,
  provider: ObjectStorageProvider = getObjectStorageProvider()
): Promise<StoredTenantAsset> {
  const descriptor = await provider.writeBuffer({
    key: buildAssetKey(input),
    contents: input.contents
  })

  return {
    fileName: basename(descriptor.relativePath),
    assetPath: descriptor.localPath || descriptor.key,
    relativePath: descriptor.relativePath
  }
}

export async function readTenantAsset(
  assetPath: string,
  provider: ObjectStorageProvider = getObjectStorageProvider()
): Promise<Buffer> {
  return provider.readBuffer(assetPath)
}
