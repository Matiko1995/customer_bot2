const ADMIN_COOKIE = 'customer_bot_admin'
const TENANT_COOKIE = 'customer_bot_tenant'
import type { TenantSessionPayload } from '../../packages/contracts/src/tenant/auth.contract'

function getAdminConfig() {
  return {
    email: process.env.CUSTOMER_BOT_ADMIN_EMAIL || 'admin@example.com',
    password: process.env.CUSTOMER_BOT_ADMIN_PASSWORD || 'admin123456'
  }
}

export function validateAdminCredentials(email: string, password: string): boolean {
  const config = getAdminConfig()
  return email === config.email && password === config.password
}

export function setAdminSession(event: Parameters<typeof setCookie>[0]) {
  setCookie(event, ADMIN_COOKIE, 'authenticated', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/'
  })
}

export function clearAdminSession(event: Parameters<typeof setCookie>[0]) {
  deleteCookie(event, ADMIN_COOKIE, {
    path: '/'
  })
}

export function requireAdminSession(event: Parameters<typeof getCookie>[0]) {
  const session = getCookie(event, ADMIN_COOKIE)
  if (session !== 'authenticated') {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }
}

export function setTenantSession(
  event: Parameters<typeof setCookie>[0],
  payload: TenantSessionPayload
) {
  setCookie(event, TENANT_COOKIE, JSON.stringify(payload), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/'
  })
}

export function clearTenantSession(event: Parameters<typeof deleteCookie>[0]) {
  deleteCookie(event, TENANT_COOKIE, {
    path: '/'
  })
}

export function requireTenantSession(event: Parameters<typeof getCookie>[0]) {
  const raw = getCookie(event, TENANT_COOKIE)
  if (!raw) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  try {
    const parsed = JSON.parse(raw) as TenantSessionPayload
    if (!parsed.tenantUserId || !parsed.tenantId || !parsed.email) {
      throw new Error('invalid tenant session')
    }
    return parsed
  } catch {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }
}
