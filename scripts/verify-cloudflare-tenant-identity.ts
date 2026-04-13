import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createCloudflareTenantIdentityApplication } from '../services/tenant-identity-service/src/infrastructure/create-cloudflare-tenant-identity-application.ts'
import type { D1Database, D1PreparedStatement } from '../server/lib/cloudflare/bindings.ts'

type Row = Record<string, unknown>

class FakePreparedStatement implements D1PreparedStatement {
  private readonly db: FakeD1Database
  private readonly query: string
  private values: unknown[] = []

  constructor(db: FakeD1Database, query: string) {
    this.db = db
    this.query = query
  }

  bind(...values: unknown[]): D1PreparedStatement {
    this.values = values
    return this
  }

  async first<T = Record<string, unknown>>(): Promise<T | null> {
    return this.db.first<T>(this.query, this.values)
  }

  async run(): Promise<unknown> {
    return this.db.run(this.query, this.values)
  }

  async all<T = Record<string, unknown>>(): Promise<{ results: T[] }> {
    return this.db.all<T>(this.query, this.values)
  }
}

class FakeD1Database implements D1Database {
  private readonly tenants = new Map<string, Row>()
  private readonly tenantUsers = new Map<string, Row>()
  private readonly tenantPasswordResets = new Map<string, Row>()

  prepare(query: string): D1PreparedStatement {
    return new FakePreparedStatement(this, query)
  }

  async batch<T = unknown>(statements: D1PreparedStatement[]): Promise<T[]> {
    const results: T[] = []
    for (const statement of statements) {
      results.push(await statement.run() as T)
    }
    return results
  }

  async first<T>(query: string, values: unknown[]): Promise<T | null> {
    if (query.includes('FROM tenants WHERE id = ?')) {
      return (this.tenants.get(String(values[0])) as T) || null
    }

    if (query.includes('FROM tenants WHERE embed_key = ?')) {
      return (Array.from(this.tenants.values()).find((item) => item.embed_key === values[0]) as T) || null
    }

    if (query.includes('FROM tenant_users WHERE lower(email) = lower(?)')) {
      return (Array.from(this.tenantUsers.values()).find((item) => item.email === String(values[0]).toLowerCase()) as T) || null
    }

    if (query.includes('FROM tenant_users WHERE id = ?')) {
      return (this.tenantUsers.get(String(values[0])) as T) || null
    }

    if (query.includes('FROM tenant_password_resets WHERE lower(email) = lower(?) AND code = ?')) {
      return (
        Array.from(this.tenantPasswordResets.values()).find(
          (item) => item.email === String(values[0]).toLowerCase() && item.code === values[1]
        ) as T
      ) || null
    }

    return null
  }

  async all<T>(query: string, values: unknown[]): Promise<{ results: T[] }> {
    if (query.includes('FROM tenants ORDER BY updated_at DESC')) {
      return { results: Array.from(this.tenants.values()) as T[] }
    }

    if (query.includes('FROM tenant_users WHERE tenant_id = ?')) {
      return {
        results: Array.from(this.tenantUsers.values()).filter((item) => item.tenant_id === values[0]) as T[]
      }
    }

    return { results: [] }
  }

  async run(query: string, values: unknown[]): Promise<unknown> {
    if (query.includes('INTO tenants')) {
      this.tenants.set(String(values[0]), {
        id: values[0],
        name: values[1],
        status: values[2],
        brand_name: values[3],
        theme_color: values[4],
        contact_phone: values[5],
        contact_email: values[6],
        contact_address: values[7],
        system_prompt: values[8],
        llm_endpoint: values[9],
        llm_api_key: values[10],
        llm_model: values[11],
        reuse_answered_questions: values[12],
        deleted_at: values[13],
        embed_key: values[14],
        rag_settings_json: values[15],
        billing_subscription_json: values[16],
        content_config_json: values[17],
        created_at: values[18],
        updated_at: values[19]
      })
      return { success: true }
    }

    if (query.includes('INTO tenant_users')) {
      this.tenantUsers.set(String(values[0]), {
        id: values[0],
        tenant_id: values[1],
        email: String(values[2]).toLowerCase(),
        password_hash: values[3],
        temporary_password: values[4],
        must_change_password: values[5],
        status: values[6],
        created_at: values[7],
        updated_at: values[8]
      })
      return { success: true }
    }

    if (query.includes('INTO tenant_password_resets')) {
      this.tenantPasswordResets.set(String(values[0]), {
        id: values[0],
        tenant_user_id: values[1],
        tenant_id: values[2],
        email: String(values[3]).toLowerCase(),
        code: values[4],
        expires_at: values[5],
        used_at: values[6],
        created_at: values[7]
      })
      return { success: true }
    }

    return { success: true }
  }
}

async function main() {
  const schema = await readFile('deploy/cloudflare/d1/001-tenant-identity.sql', 'utf8')
  assert.equal(schema.includes('CREATE TABLE IF NOT EXISTS tenants'), true)
  assert.equal(schema.includes('CREATE TABLE IF NOT EXISTS tenant_users'), true)
  assert.equal(schema.includes('CREATE TABLE IF NOT EXISTS tenant_password_resets'), true)

  const database = new FakeD1Database()
  const app = createCloudflareTenantIdentityApplication({
    TENANT_IDENTITY_DB: database
  })

  const created = await app.createTenant({
    id: 'tenant-d1',
    name: 'Tenant D1',
    contactEmail: 'tenant-d1@example.com'
  })

  assert.equal(created.item.id, 'tenant-d1')
  assert.equal(created.item.ragSettings?.enabled, false)

  const fetched = await app.getTenant('tenant-d1')
  assert.equal(fetched.item.id, 'tenant-d1')
  assert.equal(fetched.tenantUsers.length, 1)

  await app.updateTenant('tenant-d1', {
    brandName: 'Tenant D1 Updated'
  })

  const listed = await app.listTenants()
  assert.equal(listed.items.some((item) => item.id === 'tenant-d1'), true)

  console.log('cloudflare tenant identity verified')
}

void main()
