export default defineNuxtConfig({
  compatibilityDate: '2026-03-14',
  devtools: { enabled: true },
  vite: {
    server: {
      allowedHosts: ['bot.aifactory.website', 'localhost', '127.0.0.1']
    }
  },
  runtimeConfig: {
    customerBotLlmEndpoint: process.env.CUSTOMER_BOT_LLM_ENDPOINT || '',
    customerBotLlmApiKey: process.env.CUSTOMER_BOT_LLM_API_KEY || '',
    customerBotLlmModel: process.env.CUSTOMER_BOT_LLM_MODEL || '',
    customerBotWidgetVersion: process.env.CUSTOMER_BOT_WIDGET_VERSION || '',
    public: {
      customerBotPublicBaseUrl: process.env.CUSTOMER_BOT_PUBLIC_BASE_URL || 'https://bot.aifactory.website',
      customerBotStagingBaseUrl: process.env.CUSTOMER_BOT_STAGING_BASE_URL || 'https://bot.aifactory.website'
    }
  }
})
