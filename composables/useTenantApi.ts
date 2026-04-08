import { buildForwardedRequestHeaders } from '../lib/request-headers'

export function useTenantApi() {
  const requestHeaders = process.server ? useRequestHeaders(['cookie']) : undefined

  async function request<T>(url: string, options?: Parameters<typeof $fetch<T>>[1]) {
    return $fetch<T>(url, {
      credentials: 'include',
      headers: buildForwardedRequestHeaders(options?.headers, requestHeaders?.cookie),
      ...options
    })
  }

  return {
    request
  }
}
