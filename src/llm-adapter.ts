export interface LlmReplyInput {
  message: string
  context?: string
  history?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

export interface LlmReplyResult {
  content: string
  model: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  status: 'success' | 'fallback'
}

export interface LlmAdapterOptions {
  endpoint?: string
  apiKey?: string
  model?: string
  systemPrompt?: string
  soulProfile?: {
    role?: string
    tone?: string
    goals?: string[]
  }
  fetcher?: typeof fetch
  fallback: (input: LlmReplyInput) => Promise<string>
}

export function createLlmAdapter(options: LlmAdapterOptions) {
  return {
    async reply(input: LlmReplyInput): Promise<LlmReplyResult> {
      async function fallbackResult(): Promise<LlmReplyResult> {
        return {
          content: await options.fallback(input),
          model: options.model || '',
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          status: 'fallback'
        }
      }

      if (!options.endpoint || !options.apiKey || !options.model) {
        return fallbackResult()
      }

      try {
        const fetcher = options.fetcher || fetch
        const soul = options.soulProfile
          ? [
              options.soulProfile.role ? `角色：${options.soulProfile.role}` : '',
              options.soulProfile.tone ? `语气：${options.soulProfile.tone}` : '',
              options.soulProfile.goals?.length ? `目标：${options.soulProfile.goals.join('；')}` : ''
            ]
              .filter(Boolean)
              .join('\n')
          : ''

        const messages = [
          {
            role: 'system',
            content: [options.systemPrompt || '', soul].filter(Boolean).join('\n\n')
          },
          ...(input.history || []).map((item) => ({
            role: item.role,
            content: item.content
          })),
          {
            role: 'user',
            content: [input.context || '', input.message].filter(Boolean).join('\n\n')
          }
        ]

        const response = await fetcher(options.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${options.apiKey}`
          },
          body: JSON.stringify({
            model: options.model,
            messages
          })
        })

        if (!response.ok) {
          return fallbackResult()
        }

        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>
          usage?: {
            prompt_tokens?: number
            completion_tokens?: number
            total_tokens?: number
          }
        }
        const content = data.choices?.[0]?.message?.content?.trim()
        if (!content) {
          return fallbackResult()
        }

        return {
          content,
          model: options.model,
          inputTokens: data.usage?.prompt_tokens || 0,
          outputTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
          status: 'success'
        }
      } catch {
        return fallbackResult()
      }
    }
  }
}
