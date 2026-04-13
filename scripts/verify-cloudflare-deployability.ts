import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

async function main() {
  const wrangler = await readFile('wrangler.toml', 'utf8')
  assert.equal(wrangler.includes('main = "./.output/server/index.mjs"'), true)
  assert.equal(wrangler.includes('[[queues.consumers]]'), true)
  assert.equal(wrangler.includes('compatibility_flags = ["nodejs_compat"]'), true)

  const workerEntry = await readFile('workers/cloudflare-entry.mjs', 'utf8')
  assert.equal(workerEntry.includes('fetch(request, env, ctx)'), true)
  assert.equal(workerEntry.includes('queue(batch, env, ctx)'), true)
  assert.equal(workerEntry.includes('scheduled(controller, env, ctx)'), true)
  assert.equal(workerEntry.includes('processCloudflareIngestionMessage'), true)

  const buildScript = await readFile('scripts/build-cloudflare-app.mjs', 'utf8')
  assert.equal(buildScript.includes('cloudflare_module'), true)
  assert.equal(buildScript.includes('CUSTOMER_BOT_DEPLOYMENT_TARGET'), true)

  console.log('cloudflare deployability verified')
}

void main()
