import type { VectorIndexProvider } from './vector-index-provider.ts'

function dotProduct(left: number[], right: number[]): number {
  return left.reduce((sum, value, index) => sum + value * (right[index] ?? 0), 0)
}

export function createMemoryVectorIndexProvider(): VectorIndexProvider {
  const vectors = new Map<string, { values: number[]; metadata?: Record<string, unknown> }>()

  return {
    kind: 'memory',
    async upsert(items) {
      for (const item of items) {
        vectors.set(item.id, {
          values: [...item.values],
          metadata: item.metadata ? structuredClone(item.metadata) : undefined
        })
      }
    },
    async query(input) {
      const matches = Array.from(vectors.entries())
        .map(([id, item]) => ({
          id,
          score: dotProduct(input.vector, item.values),
          metadata: input.returnMetadata ? item.metadata : undefined
        }))
        .sort((left, right) => right.score - left.score)
        .slice(0, input.topK ?? 5)

      return { matches }
    }
  }
}
