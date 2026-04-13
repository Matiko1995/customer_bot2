import assert from 'node:assert/strict'
import { createTenantIdentityGateway } from '../server/lib/service-gateways/tenant-identity.ts'
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

    if (query.includes('FROM tenant_users WHERE lower(email) = lower(?)')) {
      return (Array.from(this.tenantUsers.values()).find((item) => item.email === String(values[0]).toLowerCase()) as T) || null
    }

    return null
  }

  async all<T>(query: string): Promise<{ results: T[] }> {
    if (query.includes('FROM tenants ORDER BY updated_at DESC')) {
      return { results: Array.from(this.tenants.values()) as T[] }
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

    return { success: true }
  }
}

async function main() {
  const gateway = createTenantIdentityGateway({
    bindings: {
      TENANT_IDENTITY_DB: new FakeD1Database()
    }
  })

  const created = await gateway.createTenant({
    id: 'tenant-gateway-d1',
    name: 'Tenant Gateway D1',
    contactEmail: 'tenant-gateway-d1@example.com'
  })

  assert.equal(created.ok, true)

  const listed = await gateway.listTenants()
  assert.equal(listed.items.some((item) => item.id === 'tenant-gateway-d1'), true)

  console.log('cloudflare tenant identity gateway verified')
}

void main()
