import { describe, expect, it } from 'vitest'
import { buildForwardedRequestHeaders } from '../lib/request-headers'

describe('buildForwardedRequestHeaders', () => {
  it('adds cookie header when server-side cookie is present', () => {
    const headers = buildForwardedRequestHeaders(undefined, 'customer_bot_admin=authenticated')

    expect(headers).toEqual({
      cookie: 'customer_bot_admin=authenticated'
    })
  })

  it('preserves existing headers when merging cookie header', () => {
    const headers = buildForwardedRequestHeaders(
      {
        'x-trace-id': 'trace-1'
      },
      'customer_bot_admin=authenticated'
    )

    expect(headers).toEqual({
      'x-trace-id': 'trace-1',
      cookie: 'customer_bot_admin=authenticated'
    })
  })
})
