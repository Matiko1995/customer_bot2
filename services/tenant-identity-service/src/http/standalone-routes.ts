import type { IncomingMessage, ServerResponse } from 'node:http'
import type { TenantIdentityApplication } from '../tenant-identity.application.ts'

async function readJsonBody<T>(request: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = []
  for await (const chunk of request) {
    chunks.push(Buffer.from(chunk))
  }

  const text = Buffer.concat(chunks).toString('utf8')
  return (text ? JSON.parse(text) : {}) as T
}

function sendJson(response: ServerResponse, statusCode: number, body: unknown) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(body))
}

function getPathname(request: IncomingMessage): string {
  return new URL(request.url || '/', 'http://127.0.0.1').pathname
}

export function createTenantIdentityStandaloneHandler(application: TenantIdentityApplication) {
  return async function handle(request: IncomingMessage, response: ServerResponse) {
    const method = request.method || 'GET'
    const url = new URL(request.url || '/', 'http://127.0.0.1')
    const pathname = url.pathname

    if (method === 'GET' && pathname === '/health') {
      return sendJson(response, 200, { ok: true, service: 'tenant-identity-service' })
    }

    if (method === 'POST' && pathname === '/admin/login') {
      const body = await readJsonBody<{ email: string; password: string }>(request)
      try {
        return sendJson(response, 200, application.adminLogin(body))
      } catch {
        return sendJson(response, 401, { error: 'Invalid credentials' })
      }
    }

    if (method === 'GET' && pathname === '/tenants') {
      const includeDeleted = url.searchParams.get('includeDeleted') === '1'
      return sendJson(response, 200, await application.listTenants({ includeDeleted }))
    }

    if (method === 'POST' && pathname === '/tenants') {
      const body = await readJsonBody<Record<string, unknown>>(request)
      return sendJson(response, 200, await application.createTenant(body))
    }

    if (pathname.startsWith('/tenants/')) {
      const tail = pathname.slice('/tenants/'.length)

      if (method === 'GET' && !tail.includes('/')) {
        try {
          return sendJson(response, 200, await application.getTenant(decodeURIComponent(tail)))
        } catch {
          return sendJson(response, 404, { error: 'Tenant not found' })
        }
      }

      if (method === 'PUT' && !tail.includes('/')) {
        const body = await readJsonBody<Record<string, unknown>>(request)
        try {
          return sendJson(response, 200, await application.updateTenant(decodeURIComponent(tail), body))
        } catch {
          return sendJson(response, 404, { error: 'Tenant not found' })
        }
      }

      if (method === 'DELETE' && !tail.includes('/')) {
        try {
          return sendJson(response, 200, await application.deleteTenant(decodeURIComponent(tail)))
        } catch {
          return sendJson(response, 404, { error: 'Tenant not found' })
        }
      }

      if (method === 'POST' && tail.endsWith('/restore')) {
        const tenantId = decodeURIComponent(tail.slice(0, -'/restore'.length))
        try {
          return sendJson(response, 200, await application.restoreTenant(tenantId))
        } catch {
          return sendJson(response, 404, { error: 'Tenant not found' })
        }
      }

      if (method === 'POST' && tail.endsWith('/reset-code')) {
        const tenantId = decodeURIComponent(tail.slice(0, -'/reset-code'.length))
        const body = await readJsonBody<{ loginUrl?: string }>(request)
        try {
          return sendJson(response, 200, await application.issueTenantResetCode({
            tenantId,
            loginUrl: body.loginUrl || 'http://127.0.0.1:3203/tenant/login'
          }))
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Tenant not found'
          return sendJson(response, message.includes('required') ? 400 : 404, { error: message })
        }
      }
    }

    if (method === 'POST' && pathname === '/tenant-users/login') {
      const body = await readJsonBody<{ email: string; password: string }>(request)
      try {
        return sendJson(response, 200, await application.tenantUserLogin(body))
      } catch {
        return sendJson(response, 401, { error: 'Invalid credentials' })
      }
    }

    if (method === 'POST' && pathname === '/tenant-users/me') {
      const body = await readJsonBody<{ tenantUserId: string; tenantId: string }>(request)
      try {
        return sendJson(response, 200, await application.getTenantMe(body))
      } catch {
        return sendJson(response, 401, { error: 'Unauthorized' })
      }
    }

    if (method === 'POST' && pathname === '/tenant-users/change-password') {
      const body = await readJsonBody<{
        tenantUserId: string
        tenantId: string
        email: string
        currentPassword: string
        nextPassword: string
      }>(request)
      try {
        return sendJson(response, 200, await application.changeTenantPassword(body))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Invalid credentials'
        return sendJson(response, message.includes('required') ? 400 : 401, { error: message })
      }
    }

    if (method === 'POST' && pathname === '/tenant-users/reset-code') {
      const body = await readJsonBody<{ tenantId: string; email: string; loginUrl: string }>(request)
      try {
        return sendJson(response, 200, await application.issueTenantResetCode(body))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Reset code failed'
        return sendJson(response, message.includes('required') ? 400 : 404, { error: message })
      }
    }

    if (method === 'POST' && pathname === '/tenant-users/reset-password') {
      const body = await readJsonBody<{ email: string; code: string; nextPassword: string }>(request)
      try {
        return sendJson(response, 200, await application.resetTenantPassword(body))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Reset password failed'
        return sendJson(response, 400, { error: message })
      }
    }

    sendJson(response, 404, { error: 'Not found' })
  }
}
