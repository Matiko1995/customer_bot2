export type AdminNavigationId = 'dashboard' | 'tenants' | 'chats' | 'leads' | 'billing'

export interface AdminNavigationItem {
  id: AdminNavigationId
  label: string
  description: string
  path: string
}

const adminNavigationItems: AdminNavigationItem[] = [
  {
    id: 'dashboard',
    label: '全局监控',
    description: '平台运营总览',
    path: '/admin'
  },
  {
    id: 'tenants',
    label: '租户控制',
    description: '租户运营与交付控制',
    path: '/admin/tenants'
  },
  {
    id: 'chats',
    label: '会话追踪',
    description: '聊天记录与资料命中追踪',
    path: '/admin/chats'
  },
  {
    id: 'leads',
    label: '留资中心',
    description: '客户线索与回访管理',
    path: '/admin/leads'
  },
  {
    id: 'billing',
    label: '账单运营',
    description: '套餐、消耗与账单核对',
    path: '/admin/billing'
  }
]

export function getAdminNavigationItems() {
  return adminNavigationItems
}

export function resolveAdminNavState(path: string) {
  const normalizedPath = path.split('?')[0]?.replace(/\/+$/, '') || '/admin'
  const activeItem =
    adminNavigationItems
      .filter((item) => normalizedPath === item.path || normalizedPath.startsWith(`${item.path}/`))
      .sort((left, right) => right.path.length - left.path.length)[0] || adminNavigationItems[0]

  return {
    activeId: activeItem.id,
    title: activeItem.label,
    description: activeItem.description
  }
}
