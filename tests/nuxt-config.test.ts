import { describe, expect, it } from 'vitest'

describe('nuxt config', () => {
  it('allows bot.aifactory.website in vite dev server host whitelist', async () => {
    const original = (globalThis as Record<string, unknown>).defineNuxtConfig
    ;(globalThis as Record<string, unknown>).defineNuxtConfig = (config: unknown) => config

    try {
      const module = await import('../nuxt.config')
      const config = module.default as {
        vite?: {
          server?: {
            allowedHosts?: string[]
          }
        }
      }

      expect(config.vite?.server?.allowedHosts).toContain('bot.aifactory.website')
    } finally {
      ;(globalThis as Record<string, unknown>).defineNuxtConfig = original
    }
  })
})
