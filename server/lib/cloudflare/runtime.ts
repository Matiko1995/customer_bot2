import type { CloudflareRuntimeBindings } from './bindings.ts'

declare global {
  var __CUSTOMER_BOT_CF_BINDINGS__: CloudflareRuntimeBindings | undefined
}

export function isCloudflareRuntime(): boolean {
  return Boolean(globalThis.__CUSTOMER_BOT_CF_BINDINGS__)
}

export function setCloudflareRuntimeBindings(bindings: CloudflareRuntimeBindings | undefined) {
  globalThis.__CUSTOMER_BOT_CF_BINDINGS__ = bindings
}

export function getCloudflareRuntimeBindings(
  input?: CloudflareRuntimeBindings | { cloudflare?: { env?: CloudflareRuntimeBindings } } | null
): CloudflareRuntimeBindings | undefined {
  if (!input) {
    return globalThis.__CUSTOMER_BOT_CF_BINDINGS__
  }

  if (typeof input === 'object' && input !== null && 'cloudflare' in input) {
    return input.cloudflare?.env || globalThis.__CUSTOMER_BOT_CF_BINDINGS__
  }

  return input as CloudflareRuntimeBindings
}
