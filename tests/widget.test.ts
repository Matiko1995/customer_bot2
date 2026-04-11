// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createCustomerBot } from '../src/widget'

async function flushAsyncWork(iterations = 5) {
  for (let index = 0; index < iterations; index += 1) {
    await Promise.resolve()
  }
  await new Promise((resolve) => setTimeout(resolve, 0))
}

describe('customer bot widget api', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    window.localStorage.clear()
  })

  it('renders trigger button on init', () => {
    const widget = createCustomerBot()
    widget.init({})

    expect(document.querySelector('.cbot-trigger')).not.toBeNull()
  })

  it('opens and closes the panel', () => {
    const widget = createCustomerBot()
    widget.init({})

    widget.open()
    expect(document.querySelector('.cbot-panel.is-open')).not.toBeNull()

    widget.close()
    expect(document.querySelector('.cbot-panel.is-open')).toBeNull()
  })

  it('destroys rendered dom', () => {
    const widget = createCustomerBot()
    widget.init({})

    widget.destroy()
    expect(document.querySelector('.cbot-root')).toBeNull()
  })

  it('restores persisted chat history after re-initialization', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '支持基础报价查询。' } }]
      })
    })

    const widget = createCustomerBot()
    widget.init({
      llmEndpoint: 'https://example.com/chat',
      apiKey: 'test-key',
      model: 'gpt-test',
      fetcher
    })

    const input = document.querySelector('.cbot-input') as HTMLTextAreaElement | null
    const form = document.querySelector('.cbot-chat-form') as HTMLFormElement | null

    expect(input).not.toBeNull()
    expect(form).not.toBeNull()

    if (!input || !form) {
      throw new Error('widget form not rendered')
    }

    input.value = '你们支持报价吗？'
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await flushAsyncWork()

    widget.destroy()
    document.body.innerHTML = ''

    const nextWidget = createCustomerBot()
    nextWidget.init({})
    nextWidget.open()

    const messages = Array.from(document.querySelectorAll('.cbot-message')).map((item) => item.textContent || '')

    expect(messages.some((text) => text.includes('你们支持报价吗？'))).toBe(true)
    expect(messages.some((text) => text.includes('支持基础报价查询。'))).toBe(true)
  })

  it('loads tenant config and sends chat messages to backend apis', async () => {
    const fetcher = vi.fn().mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)

      if (url.includes('/api/embed/config')) {
        return {
          ok: true,
          json: async () => ({
            tenantId: 'tenant-1',
            status: 'active',
            brandName: 'Tenant Runtime Bot',
            themeColor: '#0a7ea4',
            contactPhone: '+86 139-0000-0000',
            contactEmail: 'runtime@example.com',
            contactAddress: 'Suzhou',
            systemPrompt: 'Runtime prompt'
          })
        }
      }

      if (url.includes('/api/chat')) {
        return {
          ok: true,
          json: async () => ({
            reply: '这是后端回复',
            sessionId: 'session-1',
            usage: {
              inputTokens: 12,
              outputTokens: 8,
              totalTokens: 20
            }
          })
        }
      }

      throw new Error(`Unexpected fetch: ${url} ${JSON.stringify(init || {})}`)
    })

    const widget = createCustomerBot()
    widget.init({
      tenantId: 'tenant-1',
      fetcher
    })

    await flushAsyncWork()
    widget.open()

    const input = document.querySelector('.cbot-input') as HTMLTextAreaElement | null
    const form = document.querySelector('.cbot-chat-form') as HTMLFormElement | null

    expect(input).not.toBeNull()
    expect(form).not.toBeNull()

    if (!input || !form) {
      throw new Error('widget form not rendered')
    }

    input.value = '请介绍一下'
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await flushAsyncWork()

    const messages = Array.from(document.querySelectorAll('.cbot-message')).map((item) => item.textContent || '')
    expect(messages.some((text) => text.includes('这是后端回复'))).toBe(true)

    expect(fetcher).toHaveBeenCalledWith('/api/chat', expect.objectContaining({
      method: 'POST'
    }))
  })

  it('uses apiBaseUrl for cross-site embed requests', async () => {
    const fetcher = vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input)

      if (url.includes('/api/embed/config')) {
        return {
          ok: true,
          json: async () => ({
            tenantId: 'tenant-1',
            status: 'active',
            brandName: 'Tenant Runtime Bot',
            themeColor: '#0a7ea4',
            contactPhone: '+86 139-0000-0000',
            contactEmail: 'runtime@example.com',
            contactAddress: 'Suzhou',
            systemPrompt: 'Runtime prompt'
          })
        }
      }

      if (url.includes('/api/chat')) {
        return {
          ok: true,
          json: async () => ({
            reply: '跨站回复',
            sessionId: 'session-1'
          })
        }
      }

      throw new Error(`Unexpected fetch: ${url}`)
    })

    const widget = createCustomerBot()
    widget.init({
      tenantId: 'tenant-1',
      apiBaseUrl: 'https://bot.example.com',
      fetcher
    })

    await flushAsyncWork()

    const input = document.querySelector('.cbot-input') as HTMLTextAreaElement | null
    const form = document.querySelector('.cbot-chat-form') as HTMLFormElement | null

    if (!input || !form) {
      throw new Error('widget form not rendered')
    }

    input.value = '测试跨站'
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await flushAsyncWork()

    expect(String(fetcher.mock.calls[0]?.[0])).toBe('https://bot.example.com/api/embed/config?tenantId=tenant-1')
    expect(fetcher).toHaveBeenCalledWith('https://bot.example.com/api/chat', expect.objectContaining({ method: 'POST' }))
  })

  it('sends screenshot attachments to backend chat api and keeps them in history', async () => {
    const originalFileReader = globalThis.FileReader

    class MockFileReader {
      result: string | ArrayBuffer | null = 'data:image/png;base64,abc'
      onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null
      onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null
      error: DOMException | null = null

      readAsDataURL() {
        this.onload?.call(this as unknown as FileReader, new ProgressEvent('load') as ProgressEvent<FileReader>)
      }
    }

    vi.stubGlobal('FileReader', MockFileReader)

    const fetcher = vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input)

      if (url.includes('/api/embed/config')) {
        return {
          ok: true,
          json: async () => ({
            tenantId: 'tenant-1',
            status: 'active',
            brandName: 'Tenant Runtime Bot',
            themeColor: '#0a7ea4',
            contactPhone: '+86 139-0000-0000',
            contactEmail: 'runtime@example.com',
            contactAddress: 'Suzhou',
            systemPrompt: 'Runtime prompt'
          })
        }
      }

      if (url.includes('/api/chat')) {
        return {
          ok: true,
          json: async () => ({
            reply: '已收到截图',
            sessionId: 'session-1'
          })
        }
      }

      throw new Error(`Unexpected fetch: ${url}`)
    })

    const widget = createCustomerBot()
    widget.init({
      tenantId: 'tenant-1',
      fetcher
    })

    await flushAsyncWork()

    const fileInput = document.querySelector('.cbot-file-input') as HTMLInputElement | null
    const input = document.querySelector('.cbot-input') as HTMLTextAreaElement | null
    const form = document.querySelector('.cbot-chat-form') as HTMLFormElement | null

    expect(fileInput).not.toBeNull()
    expect(input).not.toBeNull()
    expect(form).not.toBeNull()

    if (!fileInput || !input || !form) {
      throw new Error('widget form not rendered')
    }

    const file = new File(['fake-image'], 'screenshot.png', { type: 'image/png' })
    Object.defineProperty(fileInput, 'files', {
      configurable: true,
      value: [file]
    })
    fileInput.dispatchEvent(new Event('change', { bubbles: true }))
    await flushAsyncWork()

    input.value = '请看这个截图'
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await flushAsyncWork(8)

    const chatRequest = fetcher.mock.calls.find((call) => String(call[0]).includes('/api/chat'))
    const payload = JSON.parse(String(chatRequest?.[1]?.body))

    expect(payload.attachments).toHaveLength(1)
    expect(payload.attachments[0]?.name).toBe('screenshot.png')

    const messages = Array.from(document.querySelectorAll('.cbot-message')).map((item) => item.textContent || '')
    expect(messages.some((text) => text.includes('请看这个截图'))).toBe(true)
    expect(document.querySelectorAll('.cbot-message-attachment').length).toBe(1)

    vi.stubGlobal('FileReader', originalFileReader)
  })
})
