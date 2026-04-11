export interface GatewayHttpOptions {
  baseUrl?: string
  fetcher?: typeof fetch
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '')
}

function buildUrl(baseUrl: string, path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${trimTrailingSlash(baseUrl)}${normalizedPath}`
}

export async function requestJson<T>(input: {
  baseUrl: string
  path: string
  method?: string
  body?: unknown
  fetcher?: typeof fetch
}): Promise<T> {
  const fetcher = input.fetcher || fetch
  const response = await fetcher(buildUrl(input.baseUrl, input.path), {
    method: input.method || 'GET',
    headers: input.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: input.body !== undefined ? JSON.stringify(input.body) : undefined
  })

  if (!response.ok) {
    throw new Error(`Remote gateway request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}

export async function requestText(input: {
  baseUrl: string
  path: string
  method?: string
  body?: unknown
  fetcher?: typeof fetch
}): Promise<{ text: string; contentType: string; cacheControl: string }> {
  const fetcher = input.fetcher || fetch
  const response = await fetcher(buildUrl(input.baseUrl, input.path), {
    method: input.method || 'GET',
    headers: input.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: input.body !== undefined ? JSON.stringify(input.body) : undefined
  })

  if (!response.ok) {
    throw new Error(`Remote gateway request failed: ${response.status}`)
  }

  return {
    text: await response.text(),
    contentType: response.headers.get('content-type') || 'text/plain; charset=utf-8',
    cacheControl: response.headers.get('cache-control') || ''
  }
}
