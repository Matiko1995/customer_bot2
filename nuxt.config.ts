export default defineNuxtConfig({
  server: {
    port: 804,
    host: '127.0.0.1',
  },
  nitro: {
    preset: process.env.NITRO_PRESET || undefined
  },
  compatibilityDate: '2026-03-14',
  devtools: { enabled: false },
  vite: {
    build: {
      minify: false,
      cssMinify: false,
      commonjsOptions: {
        include: []
      }
    },
    optimizeDeps: {
      noDiscovery: true,
      include: []
    },
    server: {
      allowedHosts: ['bot.aifactory.website', 'localhost', '127.0.0.1']
    }
  },
  runtimeConfig: {
    customerBotLlmEndpoint: process.env.CUSTOMER_BOT_LLM_ENDPOINT || '',
    customerBotLlmApiKey: process.env.CUSTOMER_BOT_LLM_API_KEY || '',
    customerBotLlmModel: process.env.CUSTOMER_BOT_LLM_MODEL || '',
    customerBotPlatformLlmEndpoint: process.env.CUSTOMER_BOT_PLATFORM_LLM_ENDPOINT || '',
    customerBotPlatformLlmApiKey: process.env.CUSTOMER_BOT_PLATFORM_LLM_API_KEY || '',
    customerBotPlatformLlmModel: process.env.CUSTOMER_BOT_PLATFORM_LLM_MODEL || '',
    customerBotWidgetVersion: process.env.CUSTOMER_BOT_WIDGET_VERSION || '',
    customerBotCloudflareMigrationPhase: process.env.CUSTOMER_BOT_CLOUDFLARE_MIGRATION_PHASE || '',
    public: {
      customerBotDeploymentTarget: process.env.CUSTOMER_BOT_DEPLOYMENT_TARGET || 'node',
      customerBotPublicBaseUrl: process.env.CUSTOMER_BOT_PUBLIC_BASE_URL || 'https://bot.aifactory.website',
      customerBotStagingBaseUrl: process.env.CUSTOMER_BOT_STAGING_BASE_URL || 'https://bot.aifactory.website'
    }
  }
})
