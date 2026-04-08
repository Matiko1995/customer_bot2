import { describe, expect, it, vi } from 'vitest'
import { createLlmAdapter } from '../src/llm-adapter'

describe('llm adapter', () => {
  it('falls back to local answer when llm is not configured', async () => {
    const adapter = createLlmAdapter({
      fallback: async () => 'local fallback'
    })

    await expect(adapter.reply({ message: '你好' })).resolves.toMatchObject({
      content: 'local fallback',
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      status: 'fallback'
    })
  })

  it('uses configured llm endpoint when available', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'llm reply' } }],
        usage: {
          prompt_tokens: 15,
          completion_tokens: 5,
          total_tokens: 20
        }
      })
    })

    const adapter = createLlmAdapter({
      endpoint: 'https://example.com/chat',
      apiKey: 'test-key',
      model: 'gpt-test',
      systemPrompt: 'you are a sales bot',
      fetcher,
      fallback: async () => 'local fallback'
    })

    await expect(adapter.reply({ message: '报价多少？' })).resolves.toMatchObject({
      content: 'llm reply',
      inputTokens: 15,
      outputTokens: 5,
      totalTokens: 20,
      status: 'success'
    })
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('sends prior conversation messages when history is provided', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'llm reply' } }],
        usage: {
          prompt_tokens: 18,
          completion_tokens: 6,
          total_tokens: 24
        }
      })
    })

    const adapter = createLlmAdapter({
      endpoint: 'https://example.com/chat',
      apiKey: 'test-key',
      model: 'gpt-test',
      systemPrompt: 'you are a sales bot',
      fetcher,
      fallback: async () => 'local fallback'
    })

    await expect(
      adapter.reply({
        message: '能再具体一点吗？',
        history: [
          { role: 'user', content: '你们支持报价吗？' },
          { role: 'assistant', content: '支持基础报价查询。' }
        ]
      })
    ).resolves.toMatchObject({
      content: 'llm reply',
      inputTokens: 18,
      outputTokens: 6,
      totalTokens: 24,
      status: 'success'
    })

    expect(fetcher).toHaveBeenCalledTimes(1)
    const request = fetcher.mock.calls[0]?.[1]
    expect(request).toBeTruthy()
    const body = JSON.parse(String(request?.body))

    expect(body.messages).toEqual([
      { role: 'system', content: 'you are a sales bot' },
      { role: 'user', content: '你们支持报价吗？' },
      { role: 'assistant', content: '支持基础报价查询。' },
      { role: 'user', content: '能再具体一点吗？' }
    ])
  })

  it('falls back when fetch rejects', async () => {
    const adapter = createLlmAdapter({
      endpoint: 'https://example.com/chat',
      apiKey: 'test-key',
      model: 'gpt-test',
      fetcher: vi.fn().mockRejectedValue(new Error('network down')),
      fallback: async () => 'local fallback'
    })

    await expect(adapter.reply({ message: '你好' })).resolves.toMatchObject({
      content: 'local fallback',
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      status: 'fallback'
    })
  })

  it('falls back when response json parsing fails', async () => {
    const adapter = createLlmAdapter({
      endpoint: 'https://example.com/chat',
      apiKey: 'test-key',
      model: 'gpt-test',
      fetcher: vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('invalid json')
        }
      }),
      fallback: async () => 'local fallback'
    })

    await expect(adapter.reply({ message: '你好' })).resolves.toMatchObject({
      content: 'local fallback',
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      status: 'fallback'
    })
  })
})
