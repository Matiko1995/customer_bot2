// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { createIframeHost } from '../src/iframe-host'

describe('iframe host', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('renders iframe container with provided src', () => {
    const host = createIframeHost()
    host.mount({
      iframeSrc: 'https://example.com/customer-bot-frame.html'
    })

    const iframe = document.querySelector('iframe')
    expect(iframe).not.toBeNull()
    expect(iframe?.getAttribute('src')).toBe('https://example.com/customer-bot-frame.html')
  })
})
