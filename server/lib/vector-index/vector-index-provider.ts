import type { CloudflareRuntimeBindings } from '../cloudflare/bindings.ts'
import { getCloudflareRuntimeBindings } from '../cloudflare/runtime.ts'
import { createMemoryVectorIndexProvider } from './memory-vector-index-provider.ts'
import { createCloudflareVectorIndexProvider } from './cloudflare-vector-index-provider.ts'

export interface VectorIndexMatch {
  id: string
  score: number
  metadata?: Record<string, unknown>
}

export interface VectorIndexProvider {
  kind: 'memory' | 'vectorize'
  upsert(vectors: Array<{ id: string; values: number[]; metadata?: Record<string, unknown> }>): Promise<void>
  query(input: {
    vector: number[]
    topK?: number
    filter?: Record<string, unknown>
    returnMetadata?: boolean
  }): Promise<{ matches: VectorIndexMatch[] }>
}

let sharedProvider: VectorIndexProvider | undefined

export function createVectorIndexProvider(bindings?: CloudflareRuntimeBindings): VectorIndexProvider {
  const runtimeBindings = getCloudflareRuntimeBindings(bindings)
  if (runtimeBindings?.CUSTOMER_BOT_VECTOR_INDEX) {
    return createCloudflareVectorIndexProvider(runtimeBindings.CUSTOMER_BOT_VECTOR_INDEX)
  }

  return createMemoryVectorIndexProvider()
}

export function getVectorIndexProvider(): VectorIndexProvider {
  if (!sharedProvider) {
    sharedProvider = createVectorIndexProvider()
  }

  return sharedProvider
}

export function resetVectorIndexProvider() {
  sharedProvider = undefined
}
