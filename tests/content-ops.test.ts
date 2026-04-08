import { describe, expect, it } from 'vitest'
import type { ChatMessageRecord, ChatSessionRecord, TenantContentSource } from '../types'
import {
  aggregateMatchedContentSourceStats,
  filterChatItemsByMatchedSourceId,
  filterChatItemsByMatchedSourcesOnly,
  formatMatchedSourceLabel,
  listContentSourceCategories
} from '../lib/content-ops'

describe('content ops helpers', () => {
  it('lists distinct enabled source categories', () => {
    const categories = listContentSourceCategories([
      {
        id: 'source-1',
        type: 'document',
        enabled: true,
        category: '交付',
        title: '交付手册',
        summary: '',
        content: '',
        tags: []
      },
      {
        id: 'source-2',
        type: 'webpage',
        enabled: true,
        category: '部署',
        title: '部署说明',
        summary: '',
        content: '',
        tags: []
      },
      {
        id: 'source-3',
        type: 'email',
        enabled: false,
        category: '通知',
        title: '通知邮件',
        summary: '',
        content: '',
        tags: []
      }
    ] satisfies TenantContentSource[])

    expect(categories).toEqual(['交付', '部署'])
  })

  it('filters chat items to only sessions with matched content sources', () => {
    const sessionA: ChatSessionRecord = {
      id: 'session-a',
      tenantId: 'tenant-1',
      visitorId: 'visitor-a',
      startedAt: 1,
      lastMessageAt: 2
    }

    const sessionB: ChatSessionRecord = {
      id: 'session-b',
      tenantId: 'tenant-1',
      visitorId: 'visitor-b',
      startedAt: 3,
      lastMessageAt: 4
    }

    const items = [
      {
        session: sessionA,
        messages: [
          {
            id: 'message-a1',
            sessionId: 'session-a',
            tenantId: 'tenant-1',
            role: 'assistant',
            content: '命中资料',
            createdAt: 10,
            matchedContentSources: [{ id: 'source-1', title: '交付手册', type: 'document', category: '交付' }]
          }
        ] satisfies ChatMessageRecord[]
      },
      {
        session: sessionB,
        messages: [
          {
            id: 'message-b1',
            sessionId: 'session-b',
            tenantId: 'tenant-1',
            role: 'assistant',
            content: '未命中资料',
            createdAt: 11
          }
        ] satisfies ChatMessageRecord[]
      }
    ]

    const filtered = filterChatItemsByMatchedSourcesOnly(items, true)

    expect(filtered).toHaveLength(1)
    expect(filtered[0]?.session.id).toBe('session-a')
  })

  it('aggregates matched content source hit counts', () => {
    const stats = aggregateMatchedContentSourceStats([
      {
        id: 'message-a1',
        sessionId: 'session-a',
        tenantId: 'tenant-1',
        role: 'assistant',
        content: '命中资料',
        createdAt: 10,
        matchedContentSources: [
          { id: 'source-1', title: '交付手册', type: 'document', category: '交付' },
          { id: 'source-2', title: '部署说明', type: 'webpage', category: '部署' }
        ]
      },
      {
        id: 'message-a2',
        sessionId: 'session-a',
        tenantId: 'tenant-1',
        role: 'assistant',
        content: '再次命中资料',
        createdAt: 11,
        matchedContentSources: [{ id: 'source-1', title: '交付手册', type: 'document', category: '交付' }]
      }
    ] satisfies ChatMessageRecord[])

    expect(stats).toEqual([
      {
        id: 'source-1',
        title: '交付手册',
        type: 'document',
        category: '交付',
        hits: 2
      },
      {
        id: 'source-2',
        title: '部署说明',
        type: 'webpage',
        category: '部署',
        hits: 1
      }
    ])
  })

  it('filters chat items by a specific matched source id', () => {
    const sessionA: ChatSessionRecord = {
      id: 'session-a',
      tenantId: 'tenant-1',
      visitorId: 'visitor-a',
      startedAt: 1,
      lastMessageAt: 2
    }

    const sessionB: ChatSessionRecord = {
      id: 'session-b',
      tenantId: 'tenant-1',
      visitorId: 'visitor-b',
      startedAt: 3,
      lastMessageAt: 4
    }

    const items = [
      {
        session: sessionA,
        messages: [
          {
            id: 'message-a1',
            sessionId: 'session-a',
            tenantId: 'tenant-1',
            role: 'assistant',
            content: '命中交付资料',
            createdAt: 10,
            matchedContentSources: [{ id: 'source-1', title: '交付手册', type: 'document', category: '交付' }]
          }
        ] satisfies ChatMessageRecord[]
      },
      {
        session: sessionB,
        messages: [
          {
            id: 'message-b1',
            sessionId: 'session-b',
            tenantId: 'tenant-1',
            role: 'assistant',
            content: '命中部署资料',
            createdAt: 11,
            matchedContentSources: [{ id: 'source-2', title: '部署说明', type: 'webpage', category: '部署' }]
          }
        ] satisfies ChatMessageRecord[]
      }
    ]

    const filtered = filterChatItemsByMatchedSourceId(items, 'source-2')

    expect(filtered).toHaveLength(1)
    expect(filtered[0]?.session.id).toBe('session-b')
  })
})


describe('matched source labels', () => {
  it('formats knowledge matched source label', () => {
    expect(
      formatMatchedSourceLabel({ id: 'knowledge:客户专属知识库｜标准回复', title: '客户专属知识库｜标准回复', type: 'document', category: '标准回复/知识库' })
    ).toBe('标准回复/知识库')
  })

  it('formats regular source label by type', () => {
    expect(formatMatchedSourceLabel({ id: 'source-web', title: '部署说明', type: 'webpage' })).toBe('网页资料')
  })
})
