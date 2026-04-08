import { describe, expect, it } from 'vitest'
import { buildTenantChatItems, sortTenantLeads } from '../lib/tenant-readonly'
import type { ChatMessageRecord, ChatSessionRecord, LeadRecord } from '../types'

describe('tenant readonly helpers', () => {
  it('sorts chat sessions by latest message time descending', () => {
    const sessions: ChatSessionRecord[] = [
      {
        id: 'session-1',
        tenantId: 'tenant-1',
        visitorId: 'visitor-1',
        startedAt: 100,
        lastMessageAt: 200
      },
      {
        id: 'session-2',
        tenantId: 'tenant-1',
        visitorId: 'visitor-2',
        startedAt: 300,
        lastMessageAt: 400
      }
    ]
    const messagesBySession = new Map<string, ChatMessageRecord[]>([
      [
        'session-1',
        [{ id: 'm1', sessionId: 'session-1', tenantId: 'tenant-1', role: 'user', content: 'hello', createdAt: 100 }]
      ],
      [
        'session-2',
        [{ id: 'm2', sessionId: 'session-2', tenantId: 'tenant-1', role: 'assistant', content: 'world', createdAt: 300 }]
      ]
    ])

    const items = buildTenantChatItems(sessions, messagesBySession)

    expect(items).toHaveLength(2)
    expect(items[0].session.id).toBe('session-2')
    expect(items[1].session.id).toBe('session-1')
  })

  it('sorts leads by created time descending', () => {
    const leads: LeadRecord[] = [
      {
        id: 'lead-1',
        tenantId: 'tenant-1',
        sessionId: 'session-1',
        name: 'A',
        company: 'A Co',
        contact: '111',
        demandType: 'demo',
        message: 'older',
        createdAt: 100
      },
      {
        id: 'lead-2',
        tenantId: 'tenant-1',
        sessionId: 'session-2',
        name: 'B',
        company: 'B Co',
        contact: '222',
        demandType: 'quote',
        message: 'newer',
        createdAt: 200
      }
    ]

    const items = sortTenantLeads(leads)

    expect(items[0].id).toBe('lead-2')
    expect(items[1].id).toBe('lead-1')
  })
})
