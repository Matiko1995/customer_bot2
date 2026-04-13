import { spawn } from 'node:child_process'
import process from 'node:process'

const dryRun = process.argv.includes('--dry-run')
const preload = './scripts/preload-windows-build.cjs'
const nuxtBin = './node_modules/nuxt/bin/nuxt.mjs'
const args = ['-r', preload, nuxtBin, 'build']

if (dryRun) {
  console.log(JSON.stringify({
    command: process.execPath,
    args,
    env: {
      NITRO_PRESET: 'cloudflare_module',
      CUSTOMER_BOT_DEPLOYMENT_TARGET: 'cloudflare',
      CUSTOMER_BOT_CLOUDFLARE_MIGRATION_PHASE: 'phase4'
    }
  }, null, 2))
  process.exit(0)
}

const child = spawn(process.execPath, args, {
  stdio: 'inherit',
  env: {
    ...process.env,
    NITRO_PRESET: process.env.NITRO_PRESET || 'cloudflare_module',
    CUSTOMER_BOT_DEPLOYMENT_TARGET: process.env.CUSTOMER_BOT_DEPLOYMENT_TARGET || 'cloudflare',
    CUSTOMER_BOT_CLOUDFLARE_MIGRATION_PHASE: process.env.CUSTOMER_BOT_CLOUDFLARE_MIGRATION_PHASE || 'phase4'
  }
})

child.on('exit', (code) => {
  process.exit(code ?? 1)
})

child.on('error', (error) => {
  console.error(error)
  process.exit(1)
})
