import { createLocalObjectStorageProvider } from './local-object-storage.ts'
import { createR2ObjectStorageProvider } from './r2-object-storage.ts'
import { getCloudflareRuntimeBindings } from '../cloudflare/runtime.ts'
import type { CloudflareRuntimeBindings } from '../cloudflare/bindings.ts'

export interface StoredObjectDescriptor {
  key: string
  relativePath: string
  localPath?: string
}

export interface ObjectStorageProvider {
  kind: 'local' | 'r2'
  writeBuffer(input: { key: string; contents: Buffer }): Promise<StoredObjectDescriptor>
  writeText(input: { key: string; content: string }): Promise<StoredObjectDescriptor>
  readBuffer(key: string): Promise<Buffer>
  readText(key: string): Promise<string>
  list(prefix: string): Promise<string[]>
  exists(key: string): Promise<boolean>
}

let sharedProvider: ObjectStorageProvider | undefined

export function createObjectStorageProvider(bindings?: CloudflareRuntimeBindings): ObjectStorageProvider {
  const runtimeBindings = getCloudflareRuntimeBindings(bindings)
  if (runtimeBindings?.CUSTOMER_BOT_BUCKET) {
    return createR2ObjectStorageProvider(runtimeBindings.CUSTOMER_BOT_BUCKET)
  }

  return createLocalObjectStorageProvider()
}

export function getObjectStorageProvider(): ObjectStorageProvider {
  if (!sharedProvider) {
    sharedProvider = createObjectStorageProvider()
  }

  return sharedProvider
}

export function resetObjectStorageProvider() {
  sharedProvider = undefined
}
