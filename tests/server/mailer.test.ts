import { describe, expect, it } from 'vitest'
import { mkdtemp, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { appendMailOutbox, createTenantResetEmailPayload } from '../../server/lib/mailer'

describe('mailer', () => {
  it('builds tenant reset email payload', () => {
    const payload = createTenantResetEmailPayload({
      to: 'tenant@example.com',
      code: '123456',
      expiresAt: Date.UTC(2026, 2, 21, 9, 15, 0),
      tenantName: 'Tenant Demo',
      loginUrl: 'https://bot.example.com/tenant/login'
    })

    expect(payload.subject).toContain('重置码')
    expect(payload.html).toContain('123456')
    expect(payload.html).toContain('Tenant Demo')
    expect(payload.text).toContain('https://bot.example.com/tenant/login')
  })

  it('writes outgoing mail to local outbox file', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'customer-bot-mail-'))
    const filePath = join(dir, 'outbox.json')

    await appendMailOutbox(filePath, {
      to: 'tenant@example.com',
      subject: 'Test mail',
      text: 'hello',
      html: '<p>hello</p>',
      provider: 'outbox',
      createdAt: 123
    })

    const raw = await readFile(filePath, 'utf8')
    const data = JSON.parse(raw) as Array<{ to: string; subject: string }>

    expect(data).toHaveLength(1)
    expect(data[0]).toMatchObject({
      to: 'tenant@example.com',
      subject: 'Test mail'
    })
  })
})
