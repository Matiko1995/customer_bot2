import type { VectorizeIndex } from '../cloudflare/bindings.ts'
import type { VectorIndexProvider } from './vector-index-provider.ts'

export function createCloudflareVectorIndexProvider(index: VectorizeIndex): VectorIndexProvider {
  return {
    kind: 'vectorize',
    async upsert(vectors) {
      await index.upsert(vectors)
    },
    async query(input) {
      return index.query(input.vector, {
        topK: input.topK,
        filter: input.filter,
        returnMetadata: input.returnMetadata
      })
    }
  }
}
