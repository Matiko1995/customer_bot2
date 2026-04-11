const path = require('node:path')

const rootDir = path.resolve(__dirname, '../..')
const sharedDir = process.env.CUSTOMER_BOT_SHARED_DIR || '/www/wwwroot/bot.factory.website/shared'
const logDir = path.join(sharedDir, 'logs')
const dataDir = path.join(sharedDir, '.data')

module.exports = {
  apps: [
    {
      name: 'tenant-identity-service',
      cwd: rootDir,
      script: 'node',
      args: '--experimental-strip-types services/tenant-identity-service/src/server.ts',
      interpreter: 'none',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        TENANT_IDENTITY_PORT: '3301',
        CUSTOMER_BOT_DATA_FILE: path.join(dataDir, 'customer-bot-storage.json')
      },
      out_file: path.join(logDir, 'tenant-identity.out.log'),
      error_file: path.join(logDir, 'tenant-identity.err.log')
    },
    {
      name: 'knowledge-indexing-service',
      cwd: rootDir,
      script: 'node',
      args: '--experimental-strip-types services/knowledge-indexing-service/src/server.ts',
      interpreter: 'none',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        KNOWLEDGE_INDEXING_PORT: '3302',
        CUSTOMER_BOT_DATA_FILE: path.join(dataDir, 'customer-bot-storage.json'),
        CUSTOMER_BOT_DATABASE_URL: 'postgres://user:password@127.0.0.1:5432/customer_bot_indexing'
      },
      out_file: path.join(logDir, 'knowledge-indexing.out.log'),
      error_file: path.join(logDir, 'knowledge-indexing.err.log')
    },
    {
      name: 'agent-runtime-service',
      cwd: rootDir,
      script: 'node',
      args: '--experimental-strip-types services/agent-runtime-service/src/server.ts',
      interpreter: 'none',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        AGENT_RUNTIME_PORT: '3303',
        CUSTOMER_BOT_DATA_FILE: path.join(dataDir, 'customer-bot-storage.json'),
        CUSTOMER_BOT_DATABASE_URL: 'postgres://user:password@127.0.0.1:5432/customer_bot_indexing',
        CUSTOMER_BOT_LLM_ENDPOINT: 'https://your-llm-endpoint.example/v1/chat/completions',
        CUSTOMER_BOT_LLM_API_KEY: 'sk_xxx',
        CUSTOMER_BOT_LLM_MODEL: 'gpt-4.1-mini',
        CUSTOMER_BOT_PLATFORM_LLM_ENDPOINT: 'https://your-platform-llm-endpoint.example/v1/chat/completions',
        CUSTOMER_BOT_PLATFORM_LLM_API_KEY: 'sk_platform_xxx',
        CUSTOMER_BOT_PLATFORM_LLM_MODEL: 'gpt-4.1-mini'
      },
      out_file: path.join(logDir, 'agent-runtime.out.log'),
      error_file: path.join(logDir, 'agent-runtime.err.log')
    },
    {
      name: 'embed-delivery-service',
      cwd: rootDir,
      script: 'node',
      args: '--experimental-strip-types services/embed-delivery-service/src/server.ts',
      interpreter: 'none',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        EMBED_DELIVERY_PORT: '3304',
        CUSTOMER_BOT_DATA_FILE: path.join(dataDir, 'customer-bot-storage.json'),
        CUSTOMER_BOT_WIDGET_VERSION: 'prod'
      },
      out_file: path.join(logDir, 'embed-delivery.out.log'),
      error_file: path.join(logDir, 'embed-delivery.err.log')
    },
    {
      name: 'customer-bot-app',
      cwd: rootDir,
      script: 'node',
      args: '-r ./scripts/preload-windows-build.cjs ./.output/server/index.mjs',
      interpreter: 'none',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        HOST: '127.0.0.1',
        PORT: '3203',
        CUSTOMER_BOT_PUBLIC_BASE_URL: 'https://bot.factory.website',
        CUSTOMER_BOT_STAGING_BASE_URL: 'https://bot.factory.website',
        TENANT_IDENTITY_SERVICE_URL: 'https://bot.factory.website/identity',
        KNOWLEDGE_INDEXING_SERVICE_URL: 'https://bot.factory.website/indexing',
        AGENT_RUNTIME_SERVICE_URL: 'https://bot.factory.website/runtime',
        EMBED_DELIVERY_SERVICE_URL: 'https://bot.factory.website/embed',
        CUSTOMER_BOT_WIDGET_VERSION: 'prod'
      },
      out_file: path.join(logDir, 'customer-bot-app.out.log'),
      error_file: path.join(logDir, 'customer-bot-app.err.log')
    }
  ]
}
