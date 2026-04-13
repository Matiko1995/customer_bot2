import type { R2Bucket } from '../cloudflare/bindings.ts'
import type { ObjectStorageProvider } from './object-storage.ts'

export function createR2ObjectStorageProvider(bucket: R2Bucket): ObjectStorageProvider {
  return {
    kind: 'r2',
    async writeBuffer(input) {
      await bucket.put(input.key, input.contents)
      return {
        key: input.key,
        relativePath: input.key
      }
    },
    async writeText(input) {
      await bucket.put(input.key, input.content)
      return {
        key: input.key,
        relativePath: input.key
      }
    },
    async readBuffer(key) {
      const object = await bucket.get(key)
      if (!object) {
        throw new Error(`R2 object not found: ${key}`)
      }

      return Buffer.from(await object.arrayBuffer())
    },
    async readText(key) {
      const object = await bucket.get(key)
      if (!object) {
        throw new Error(`R2 object not found: ${key}`)
      }

      return object.text()
    },
    async list(prefix) {
      const result = await bucket.list({ prefix })
      return result.objects.map((item) => item.key)
    },
    async exists(key) {
      return (await bucket.get(key)) !== null
    }
  }
}
