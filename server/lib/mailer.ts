import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

export interface OutgoingMailRecord {
  to: string
  subject: string
  text: string
  html: string
  provider: 'outbox' | 'resend'
  createdAt: number
}

export interface MailPayload {
  to: string
  subject: string
  text: string
  html: string
}

export interface TenantResetEmailInput {
  to: string
  code: string
  expiresAt: number
  tenantName: string
  loginUrl: string
}

function getMailOutboxPath() {
  return process.env.CUSTOMER_BOT_MAIL_OUTBOX_FILE || resolve(process.cwd(), '.data/customer-bot-mail-outbox.json')
}

function getBaseUrl() {
  return (
    process.env.CUSTOMER_BOT_PUBLIC_BASE_URL ||
    process.env.CUSTOMER_BOT_STAGING_BASE_URL ||
    'https://bot.aifactory.website'
  ).replace(/\/+$/, '')
}

export function createTenantResetEmailPayload(input: TenantResetEmailInput): MailPayload {
  const expiresAt = new Date(input.expiresAt).toLocaleString()
  const subject = `【${input.tenantName}】租户后台重置码`
  const text =
    `租户：${input.tenantName}\n` +
    `你的租户后台重置码是：${input.code}\n` +
    `有效期至：${expiresAt}\n` +
    `登录地址：${input.loginUrl}\n` +
    `如果这不是你的操作，请忽略本邮件。`
  const html =
    `<p>租户：<strong>${input.tenantName}</strong></p>` +
    `<p>你的租户后台重置码是：<strong>${input.code}</strong></p>` +
    `<p>有效期至：${expiresAt}</p>` +
    `<p>登录地址：<a href="${input.loginUrl}">${input.loginUrl}</a></p>` +
    `<p>如果这不是你的操作，请忽略本邮件。</p>`

  return {
    to: input.to,
    subject,
    text,
    html
  }
}

export async function appendMailOutbox(filePath: string, record: OutgoingMailRecord) {
  let items: OutgoingMailRecord[] = []

  try {
    const raw = await readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw) as unknown
    items = Array.isArray(parsed) ? (parsed as OutgoingMailRecord[]) : []
  } catch (error) {
    const maybe = error as NodeJS.ErrnoException
    if (maybe?.code !== 'ENOENT') {
      throw error
    }
  }

  items.push(record)
  await mkdir(dirname(filePath), { recursive: true })
  await writeFile(filePath, JSON.stringify(items, null, 2), 'utf8')
}

async function sendByResend(payload: MailPayload) {
  const apiKey = process.env.CUSTOMER_BOT_RESEND_API_KEY?.trim()
  const from = process.env.CUSTOMER_BOT_MAIL_FROM?.trim()

  if (!apiKey || !from) {
    throw new Error('Resend mail is not configured')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text
    })
  })

  if (!response.ok) {
    throw new Error(`Resend send failed: ${response.status}`)
  }
}

export async function sendTenantResetEmail(input: TenantResetEmailInput) {
  const payload = createTenantResetEmailPayload({
    ...input,
    loginUrl: input.loginUrl || `${getBaseUrl()}/tenant/login`
  })
  const provider = process.env.CUSTOMER_BOT_MAIL_PROVIDER?.trim().toLowerCase()
  const createdAt = Date.now()

  if (provider === 'resend') {
    await sendByResend(payload)
    return {
      delivered: true,
      provider: 'resend' as const,
      previewCode: ''
    }
  }

  await appendMailOutbox(getMailOutboxPath(), {
    ...payload,
    provider: 'outbox',
    createdAt
  })

  return {
    delivered: false,
    provider: 'outbox' as const,
    previewCode: input.code
  }
}
