import { createHash, randomInt } from 'node:crypto'
import type { TenantPasswordResetRecord, TenantRecord, TenantUserRecord } from '../../types'
import type { StorageRepository } from './storage/types'

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function generateInitialPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let output = ''
  for (let index = 0; index < 10; index += 1) {
    output += chars[randomInt(0, chars.length)]
  }
  return output
}

function generateResetCode() {
  return String(randomInt(0, 1000000)).padStart(6, '0')
}

function buildFallbackEmail(tenant: TenantRecord) {
  return `${tenant.id}@tenant.local`
}

export async function createTenantLoginForTenant(input: {
  tenant: TenantRecord
  storage: StorageRepository
  now?: number
}) {
  const now = input.now ?? Date.now()
  const email = normalizeEmail(input.tenant.contactEmail || buildFallbackEmail(input.tenant))
  const existing = await input.storage.getTenantUserByEmail(email)

  if (existing) {
    return {
      user: existing,
      initialPassword: existing.temporaryPassword || ''
    }
  }

  const initialPassword = generateInitialPassword()
  const user: TenantUserRecord = {
    id: `tenant-user-${input.tenant.id}`,
    tenantId: input.tenant.id,
    email,
    passwordHash: hashPassword(initialPassword),
    temporaryPassword: initialPassword,
    mustChangePassword: true,
    status: 'active',
    createdAt: now,
    updatedAt: now
  }

  await input.storage.saveTenantUser(user)

  return {
    user,
    initialPassword
  }
}

export async function verifyTenantPassword(email: string, password: string, storage: StorageRepository) {
  const user = await storage.getTenantUserByEmail(email)
  if (!user || user.status !== 'active') {
    return null
  }

  return user.passwordHash === hashPassword(password) ? user : null
}

export async function issueTenantPasswordReset(input: {
  email: string
  storage: StorageRepository
  now?: number
}) {
  const user = await input.storage.getTenantUserByEmail(input.email)
  if (!user) {
    throw new Error('租户账号不存在')
  }

  const now = input.now ?? Date.now()
  const record: TenantPasswordResetRecord = {
    id: `tenant-reset-${user.id}-${now}`,
    tenantUserId: user.id,
    tenantId: user.tenantId,
    email: user.email,
    code: generateResetCode(),
    expiresAt: now + 15 * 60 * 1000,
    usedAt: 0,
    createdAt: now
  }

  await input.storage.saveTenantPasswordReset(record)
  return record
}

export async function resetTenantPassword(input: {
  email: string
  code: string
  nextPassword: string
  storage: StorageRepository
  now?: number
}) {
  const normalizedEmail = normalizeEmail(input.email)
  const record = await input.storage.getTenantPasswordResetByCode(normalizedEmail, input.code.trim())
  const now = input.now ?? Date.now()

  if (!record || record.usedAt || record.expiresAt < now) {
    throw new Error('验证码无效或已过期')
  }

  const user = await input.storage.getTenantUserById(record.tenantUserId)
  if (!user) {
    throw new Error('租户账号不存在')
  }

  const updatedUser: TenantUserRecord = {
    ...user,
    passwordHash: hashPassword(input.nextPassword),
    temporaryPassword: '',
    mustChangePassword: false,
    updatedAt: now
  }

  const updatedReset: TenantPasswordResetRecord = {
    ...record,
    usedAt: now
  }

  await input.storage.saveTenantUser(updatedUser)
  await input.storage.saveTenantPasswordReset(updatedReset)

  return updatedUser
}
