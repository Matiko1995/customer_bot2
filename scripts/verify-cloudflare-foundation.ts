import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

async function read(path: string) {
  return readFile(path, 'utf8')
}

async function main() {
  const wrangler = await read('wrangler.toml')
  assert.equal(wrangler.includes('d1_databases'), true)
  assert.equal(wrangler.includes('r2_buckets'), true)
  assert.equal(wrangler.includes('queues'), true)
  assert.equal(wrangler.includes('vectorize'), true)

  const bindings = await read('server/lib/cloudflare/bindings.ts')
  assert.equal(bindings.includes('export interface CloudflareRuntimeBindings'), true)
  assert.equal(bindings.includes('D1Database'), true)
  assert.equal(bindings.includes('R2Bucket'), true)

  const runtime = await read('server/lib/cloudflare/runtime.ts')
  assert.equal(runtime.includes('getCloudflareRuntimeBindings'), true)
  assert.equal(runtime.includes('isCloudflareRuntime'), true)

  const objectStorage = await read('server/lib/object-storage/object-storage.ts')
  assert.equal(objectStorage.includes('interface ObjectStorageProvider'), true)

  const localObjectStorage = await read('server/lib/object-storage/local-object-storage.ts')
  assert.equal(localObjectStorage.includes('createLocalObjectStorageProvider'), true)

  const r2ObjectStorage = await read('server/lib/object-storage/r2-object-storage.ts')
  assert.equal(r2ObjectStorage.includes('createR2ObjectStorageProvider'), true)

  const storageProvider = await read('server/lib/providers/storage-provider.ts')
  assert.equal(storageProvider.includes('createStorageProvider'), true)

  const ragProvider = await read('server/lib/providers/rag-provider.ts')
  assert.equal(ragProvider.includes('createRagProvider'), true)

  const queuePublisher = await read('server/lib/tasks/queue-publisher.ts')
  assert.equal(queuePublisher.includes('interface QueuePublisher'), true)

  const localQueuePublisher = await read('server/lib/tasks/local-queue-publisher.ts')
  assert.equal(localQueuePublisher.includes('createLocalQueuePublisher'), true)

  const cloudflareQueuePublisher = await read('server/lib/tasks/cloudflare-queue-publisher.ts')
  assert.equal(cloudflareQueuePublisher.includes('createCloudflareQueuePublisher'), true)

  const assetStore = await read('server/lib/assets/file-asset-store.ts')
  assert.equal(assetStore.includes('ObjectStorageProvider'), true)

  const agentDocPaths = await read('server/lib/agent-docs/paths.ts')
  assert.equal(agentDocPaths.includes('ObjectStorageProvider'), true)

  const storageIndex = await read('server/lib/storage/index.ts')
  assert.equal(storageIndex.includes('createStorageProvider'), true)

  const executeJob = await read('server/lib/ingestion/execute-job.ts')
  assert.equal(executeJob.includes('QueuePublisher'), true)

  console.log('cloudflare foundation verified')
}

void main()
