import { describe, expect, it } from 'vitest'
import { classifyQuery } from '../../server/lib/rag/query-classifier'

describe('query classifier', () => {
  it('routes price questions to price fast path', () => {
    expect(classifyQuery('这个产品多少钱')).toBe('price')
  })

  it('routes faq questions to faq fast path', () => {
    expect(classifyQuery('你们支持 IMAP 吗')).toBe('faq')
  })
})
