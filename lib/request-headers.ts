export function buildForwardedRequestHeaders(
  headers?: HeadersInit,
  cookieHeader?: string
): HeadersInit | undefined {
  if (!cookieHeader) {
    return headers
  }

  if (!headers) {
    return {
      cookie: cookieHeader
    }
  }

  if (headers instanceof Headers) {
    const merged = new Headers(headers)
    if (!merged.has('cookie')) {
      merged.set('cookie', cookieHeader)
    }
    return merged
  }

  if (Array.isArray(headers)) {
    const hasCookie = headers.some(([key]) => key.toLowerCase() === 'cookie')
    return hasCookie ? headers : [...headers, ['cookie', cookieHeader]]
  }

  if ('cookie' in headers || 'Cookie' in headers) {
    return headers
  }

  return {
    ...headers,
    cookie: cookieHeader
  }
}
