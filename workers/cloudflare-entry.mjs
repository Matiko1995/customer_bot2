import { processCloudflareIngestionMessage } from '../services/knowledge-indexing-service/src/infrastructure/cloudflare-ingestion-consumer.ts'
import { setCloudflareRuntimeBindings } from '../server/lib/cloudflare/runtime.ts'

async function loadNuxtHandler(env) {
  setCloudflareRuntimeBindings(env)
  const mod = await import('../.output/server/index.mjs')

  if (mod?.default?.fetch) {
    return mod.default.fetch.bind(mod.default)
  }

  if (typeof mod.fetch === 'function') {
    return mod.fetch
  }

  throw new Error('Nuxt Cloudflare handler is unavailable. Run the Cloudflare build first.')
}

export default {
  async fetch(request, env, ctx) {
    const handler = await loadNuxtHandler(env)
    return handler(request, env, ctx)
  },

  async queue(batch, env, ctx) {
    for (const message of batch.messages) {
      const body = message.body || {}

      if (body.type === 'knowledge-indexing.sync') {
        await processCloudflareIngestionMessage({
          bindings: env,
          payload: body.payload
        })
        message.ack()
        continue
      }

      message.ack()
    }
  },

  async scheduled(controller, env, ctx) {
    void controller
    void env
    void ctx
  }
}
