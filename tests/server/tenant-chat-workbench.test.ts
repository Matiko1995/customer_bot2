import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryStore } from '../../server/lib/storage/memory-store'
import type { StorageRepository } from '../../server/lib/storage/types'
import type { TenantUserRecord } from '../../types'

vi.mock('h3', () => ({
  defineEventHandler: (handler: unknown) => handler,
  createError: (input: { statusCode: number; statusMessage: string }) => Object.assign(new Error(input.statusMessage), input),
  getRouterParam: (event: EventLike, name: string) => event.context.params?.[name],
  getQuery: (event: EventLike) => event.context.query ?? {},
  readBody: async (event: EventLike) => event.context.body
}))

vi.mock('../../server/lib/auth', () => ({
  requireTenantSession: vi.fn()
}))

vi.mock('../../server/lib/storage', () => ({
  getStorage: vi.fn()
}))

type TenantSessionPayload = {
  tenantUserId: string
  tenantId: string
  email: string
}

type EventLike = {
  context: {
    params?: Record<string, string>
    query?: Record<string, unknown>
    body?: unknown
  }
}

let listChatsHandler: (event: EventLike) => Promise<any>
let getChatDetailHandler: (event: EventLike) => Promise<any>
let takeoverHandler: (event: EventLike) => Promise<any>
let replyHandler: (event: EventLike) => Promise<any>
let releaseHandler: (event: EventLike) => Promise<any>
let requireTenantSessionMock: ReturnType<typeof vi.fn>
let getStorageMock: ReturnType<typeof vi.fn>

beforeAll(async () => {
  ;(globalThis as any).defineEventHandler = (handler: unknown) => handler
  ;(globalThis as any).createError = (input: { statusCode: number; statusMessage: string }) => Object.assign(new Error(input.statusMessage), input)
  ;(globalThis as any).getRouterParam = (event: EventLike, name: string) => event.context.params?.[name]
  ;(globalThis as any).getQuery = (event: EventLike) => event.context.query ?? {}
  ;(globalThis as any).readBody = async (event: EventLike) => event.context.body

  const authModule = await import('../../server/lib/auth')
  const storageModule = await import('../../server/lib/storage')
  requireTenantSessionMock = vi.mocked(authModule.requireTenantSession)
  getStorageMock = vi.mocked(storageModule.getStorage)

  listChatsHandler = (await import('../../server/api/tenant/chats.get')).default as typeof listChatsHandler
  getChatDetailHandler = (await import('../../server/api/tenant/chats/[sessionId].get')).default as typeof getChatDetailHandler
  takeoverHandler = (await import('../../server/api/tenant/chats/[sessionId]/takeover.post')).default as typeof takeoverHandler
  replyHandler = (await import('../../server/api/tenant/chats/[sessionId]/reply.post')).default as typeof replyHandler
  releaseHandler = (await import('../../server/api/tenant/chats/[sessionId]/release.post')).default as typeof releaseHandler
})

function createTenantUser(overrides: Partial<TenantUserRecord> = {}): TenantUserRecord {
  return {
    id: 'seat-1',
    tenantId: 'tenant-1',
    email: 'seat-1@example.com',
    displayName: 'Seat One',
    seatRole: 'agent',
    passwordHash: 'hash',
    mustChangePassword: false,
    status: 'active',
    createdAt: 100,
    updatedAt: 100,
    ...overrides
  }
}

async function seedWorkbenchStore(): Promise<StorageRepository> {
  const store = createMemoryStore()

  await store.saveTenant({
    id: 'tenant-1',
    name: 'Tenant 1',
    status: 'active',
    brandName: 'Tenant 1 Bot',
    themeColor: '#118ab2',
    contactPhone: '',
    contactEmail: 'tenant1@example.com',
    contactAddress: '',
    systemPrompt: 'You are the tenant bot.',
    embedKey: 'embed-tenant-1',
    createdAt: 100,
    updatedAt: 100
  })

  await store.saveTenantUser(createTenantUser({ id: 'seat-1', email: 'seat-1@example.com', displayName: 'Seat One', seatRole: 'agent' }))
  await store.saveTenantUser(createTenantUser({ id: 'seat-2', email: 'seat-2@example.com', displayName: 'Seat Two', seatRole: 'owner' }))

  await store.saveSession({
    id: 'session-1',
    tenantId: 'tenant-1',
    visitorId: 'visitor-1',
    startedAt: 1000,
    lastMessageAt: 1400,
    conversationMode: 'ai_active'
  })
  await store.saveMessage({
    id: 'message-1',
    sessionId: 'session-1',
    tenantId: 'tenant-1',
    role: 'user',
    senderType: 'customer',
    senderName: 'Visitor One',
    content: '我想了解报价方案',
    createdAt: 1400
  })

  await store.saveSession({
    id: 'session-2',
    tenantId: 'tenant-1',
    visitorId: 'visitor-2',
    startedAt: 1500,
    lastMessageAt: 1900,
    conversationMode: 'human_active',
    assignedTenantUserId: 'seat-2',
    assignedTenantUserName: 'Seat Two',
    humanActivatedAt: 1800
  })
  await store.saveMessage({
    id: 'message-2',
    sessionId: 'session-2',
    tenantId: 'tenant-1',
    role: 'user',
    senderType: 'customer',
    senderName: 'Visitor Two',
    content: '我要人工客服',
    createdAt: 1800
  })
  await store.saveMessage({
    id: 'message-3',
    sessionId: 'session-2',
    tenantId: 'tenant-1',
    role: 'assistant',
    senderType: 'agent',
    senderTenantUserId: 'seat-2',
    senderName: 'Seat Two',
    content: '您好，我来接手。',
    createdAt: 1900
  })

  return store
}

function setTenantSession(payload: TenantSessionPayload) {
  requireTenantSessionMock.mockReturnValue(payload)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('tenant chat workbench api', () => {
  it('returns chat list summaries with conversation mode ordered by lastMessageAt desc', async () => {
    const store = await seedWorkbenchStore()
    getStorageMock.mockReturnValue(store)
    setTenantSession({ tenantUserId: 'seat-1', tenantId: 'tenant-1', email: 'seat-1@example.com' })

    const response = await listChatsHandler({ context: { query: {} } })

    expect(response.items).toHaveLength(2)
    expect(response.items[0]).toMatchObject({
      sessionId: 'session-2',
      conversationMode: 'human_active',
      assignedTenantUserId: 'seat-2',
      assignedTenantUserName: 'Seat Two',
      lastSenderType: 'agent',
      lastMessagePreview: '您好，我来接手。',
      messageCount: 2,
      hasUnreadCustomerMessage: false
    })
    expect(response.items[1]).toMatchObject({
      sessionId: 'session-1',
      conversationMode: 'ai_active',
      lastSenderType: 'customer',
      lastMessagePreview: '我想了解报价方案',
      messageCount: 1,
      hasUnreadCustomerMessage: true
    })
  })

  it('returns chat detail with messages and available actions', async () => {
    const store = await seedWorkbenchStore()
    getStorageMock.mockReturnValue(store)
    setTenantSession({ tenantUserId: 'seat-1', tenantId: 'tenant-1', email: 'seat-1@example.com' })

    const response = await getChatDetailHandler({ context: { params: { sessionId: 'session-1' } } })

    expect(response.session).toMatchObject({
      id: 'session-1',
      conversationMode: 'ai_active'
    })
    expect(response.messages).toHaveLength(1)
    expect(response.messages[0]).toMatchObject({
      id: 'message-1',
      senderType: 'customer',
      content: '我想了解报价方案'
    })
    expect(response.availableActions).toEqual({
      canTakeover: true,
      canReply: false,
      canRelease: false
    })
  })

  it('allows the current tenant seat to take over a chat', async () => {
    const store = await seedWorkbenchStore()
    getStorageMock.mockReturnValue(store)
    setTenantSession({ tenantUserId: 'seat-1', tenantId: 'tenant-1', email: 'seat-1@example.com' })

    const response = await takeoverHandler({ context: { params: { sessionId: 'session-1' } } })
    const updated = await store.getSessionById('session-1')

    expect(response.session).toMatchObject({
      id: 'session-1',
      conversationMode: 'human_active',
      assignedTenantUserId: 'seat-1',
      assignedTenantUserName: 'Seat One'
    })
    expect(updated).toMatchObject({
      conversationMode: 'human_active',
      assignedTenantUserId: 'seat-1',
      assignedTenantUserName: 'Seat One'
    })
    expect(response.availableActions).toEqual({
      canTakeover: false,
      canReply: true,
      canRelease: true
    })
  })

  it('returns conflict when the chat is already taken by another seat', async () => {
    const store = await seedWorkbenchStore()
    getStorageMock.mockReturnValue(store)
    setTenantSession({ tenantUserId: 'seat-1', tenantId: 'tenant-1', email: 'seat-1@example.com' })

    await expect(takeoverHandler({ context: { params: { sessionId: 'session-2' } } })).rejects.toMatchObject({
      statusCode: 409,
      statusMessage: 'Chat already assigned to another tenant user'
    })
  })

  it('only allows the assigned seat to send a human reply', async () => {
    const store = await seedWorkbenchStore()
    getStorageMock.mockReturnValue(store)
    setTenantSession({ tenantUserId: 'seat-1', tenantId: 'tenant-1', email: 'seat-1@example.com' })

    await expect(
      replyHandler({
        context: {
          params: { sessionId: 'session-2' },
          body: { content: '我来回复客户' }
        }
      })
    ).rejects.toMatchObject({
      statusCode: 403,
      statusMessage: 'Only the assigned tenant user can reply'
    })

    setTenantSession({ tenantUserId: 'seat-2', tenantId: 'tenant-1', email: 'seat-2@example.com' })
    const response = await replyHandler({
      context: {
        params: { sessionId: 'session-2' },
        body: { content: '这是人工客服回复' }
      }
    })

    const messages = await store.listMessagesBySession('session-2')
    const latest = messages[messages.length - 1]

    expect(response.message).toMatchObject({
      senderType: 'agent',
      senderTenantUserId: 'seat-2',
      senderName: 'Seat Two',
      content: '这是人工客服回复'
    })
    expect(latest).toMatchObject({
      senderType: 'agent',
      senderTenantUserId: 'seat-2',
      senderName: 'Seat Two',
      content: '这是人工客服回复'
    })
    expect(response.session.lastMessageAt).toBe(latest?.createdAt)
  })

  it('releases a human-owned chat back to ai_active', async () => {
    const store = await seedWorkbenchStore()
    getStorageMock.mockReturnValue(store)
    setTenantSession({ tenantUserId: 'seat-2', tenantId: 'tenant-1', email: 'seat-2@example.com' })

    const response = await releaseHandler({ context: { params: { sessionId: 'session-2' } } })
    const updated = await store.getSessionById('session-2')

    expect(response.session).toMatchObject({
      id: 'session-2',
      conversationMode: 'ai_active',
      assignedTenantUserId: 'seat-2',
      assignedTenantUserName: 'Seat Two'
    })
    expect(updated).toMatchObject({
      conversationMode: 'ai_active',
      humanReleasedAt: expect.any(Number)
    })
    expect(response.availableActions).toEqual({
      canTakeover: true,
      canReply: false,
      canRelease: false
    })
  })
})
