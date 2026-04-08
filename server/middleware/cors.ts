function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/$/, '')
}

function resolveAllowedOrigins(): string[] {
  const defaults = ['https://www.aifactory.website', 'https://aifactory.website', 'http://localhost:3000']
  const raw = process.env.CUSTOMER_BOT_ALLOWED_ORIGINS || defaults.join(',')

  return raw
    .split(',')
    .map((item) => normalizeOrigin(item))
    .filter(Boolean)
}

export default defineEventHandler((event) => {
  const requestOrigin = typeof getHeader(event, 'origin') === 'string' ? normalizeOrigin(String(getHeader(event, 'origin'))) : ''
  const allowedOrigins = resolveAllowedOrigins()
  const allowOrigin = requestOrigin && allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigins[0] || '*'

  setHeader(event, 'Access-Control-Allow-Origin', allowOrigin)
  setHeader(event, 'Vary', 'Origin')
  setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (getMethod(event) === 'OPTIONS') {
    setResponseStatus(event, 204)
    return ''
  }
})
