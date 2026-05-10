import { describe, expect, it } from 'vitest'
import { getAdminNavigationItems, resolveAdminNavState } from '../lib/admin-navigation'

describe('admin navigation', () => {
  it('exposes the reference-style admin command routes', () => {
    const items = getAdminNavigationItems()

    expect(items.map((item) => item.id)).toEqual(['dashboard', 'tenants', 'chats', 'leads', 'billing'])
    expect(items.map((item) => item.path)).toEqual(['/admin', '/admin/tenants', '/admin/chats', '/admin/leads', '/admin/billing'])
    expect(items[0]?.label).toBe('全局监控')
  })

  it('marks nested tenant workspace routes as tenant control', () => {
    const state = resolveAdminNavState('/admin/tenants/acme-industrial')

    expect(state.activeId).toBe('tenants')
    expect(state.title).toBe('租户控制')
  })
})
