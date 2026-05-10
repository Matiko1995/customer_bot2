<script setup lang="ts">
import type { Component } from 'vue'
import {
  Activity,
  Bell,
  Bot,
  Layers,
  LogOut,
  Menu,
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  Terminal,
  UserRoundPlus,
  Zap
} from '../../lib/lucide-icons'
import { getAdminNavigationItems, resolveAdminNavState, type AdminNavigationId } from '../../lib/admin-navigation'

const props = withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    eyebrow?: string
    statusLabel?: string
    statusTone?: 'normal' | 'warning' | 'danger'
    searchPlaceholder?: string
  }>(),
  {
    title: '',
    subtitle: '',
    eyebrow: '系统管理',
    statusLabel: '系统正常',
    statusTone: 'normal',
    searchPlaceholder: '搜索租户、会话或账单...'
  }
)

const route = useRoute()
const isSidebarOpen = ref(true)
const searchTerm = ref('')
const navigationItems = getAdminNavigationItems()
const navState = computed(() => resolveAdminNavState(route.path))
const resolvedTitle = computed(() => props.title || navState.value.title)
const resolvedSubtitle = computed(() => props.subtitle || navState.value.description)

const icons: Record<AdminNavigationId, Component> = {
  dashboard: Activity,
  tenants: Layers,
  chats: MessageSquareText,
  leads: UserRoundPlus,
  billing: ReceiptText
}

const activeIcon = computed(() => icons[navState.value.activeId] || Activity)

function submitSearch() {
  const keyword = searchTerm.value.trim()
  if (!keyword) {
    return
  }

  navigateTo({
    path: '/admin/tenants',
    query: { q: keyword }
  })
}
</script>

<template>
  <div class="nova-admin-shell" :class="{ 'sidebar-collapsed': !isSidebarOpen }">
    <aside class="nova-sidebar">
      <div class="brand-block">
        <div class="brand-mark">
          <Bot :size="18" />
        </div>
        <transition name="fade-slide">
          <div v-if="isSidebarOpen" class="brand-copy">
            <strong>智服多租户平台</strong>
            <span>智能客服运营</span>
          </div>
        </transition>
      </div>

      <nav class="side-nav" aria-label="后台导航">
        <p class="nav-kicker" :class="{ hidden: !isSidebarOpen }">系统管理</p>
        <NuxtLink
          v-for="item in navigationItems"
          :key="item.id"
          :to="item.path"
          class="side-nav-item"
          :class="{ active: navState.activeId === item.id }"
          :aria-label="item.label"
        >
          <component :is="icons[item.id]" :size="18" />
          <transition name="fade-slide">
            <span v-if="isSidebarOpen">{{ item.label }}</span>
          </transition>
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <div class="admin-avatar">
          <ShieldCheck :size="16" />
        </div>
        <transition name="fade-slide">
          <div v-if="isSidebarOpen" class="admin-identity">
            <strong>超级管理员</strong>
            <span>admin@system.com</span>
          </div>
        </transition>
        <NuxtLink v-if="isSidebarOpen" to="/admin/login" class="logout-link" aria-label="返回登录页">
          <LogOut :size="15" />
        </NuxtLink>
      </div>
    </aside>

    <section class="nova-main">
      <header class="nova-topbar">
        <div class="topbar-title">
          <button type="button" class="icon-button mobile-menu" aria-label="打开导航" @click="isSidebarOpen = !isSidebarOpen">
            <Menu :size="20" />
          </button>
          <button type="button" class="icon-button desktop-collapse" aria-label="折叠导航" @click="isSidebarOpen = !isSidebarOpen">
            <PanelLeftClose v-if="isSidebarOpen" :size="18" />
            <PanelLeftOpen v-else :size="18" />
          </button>
          <div class="active-view-icon">
            <component :is="activeIcon" :size="18" />
          </div>
          <div>
            <p>{{ eyebrow }}</p>
            <h1>{{ resolvedTitle }}</h1>
          </div>
          <span class="system-pill" :class="statusTone">{{ statusLabel }}</span>
        </div>

        <div class="topbar-actions">
          <form class="admin-search" @submit.prevent="submitSearch">
            <Search :size="15" />
            <input v-model.trim="searchTerm" type="search" :placeholder="searchPlaceholder" />
          </form>
          <slot name="toolbar" />
          <button type="button" class="icon-button" aria-label="通知">
            <Bell :size="19" />
            <span class="alert-dot" />
          </button>
          <NuxtLink to="/admin/tenants" class="icon-button" aria-label="系统设置">
            <Settings :size="19" />
          </NuxtLink>
        </div>
      </header>

      <main class="nova-content">
        <section class="content-header">
          <div>
            <p>{{ navState.description }}</p>
            <h2>{{ resolvedSubtitle }}</h2>
          </div>
          <div class="content-status">
            <Zap :size="14" />
            <span>实时运行</span>
          </div>
        </section>
        <slot />
      </main>

      <NuxtLink to="/admin/chats" class="floating-terminal" aria-label="打开会话追踪">
        <Terminal :size="22" />
        <span />
      </NuxtLink>
    </section>
  </div>
</template>

<style scoped>
.nova-admin-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 248px minmax(0, 1fr);
  background: #f8fafc;
  color: #1e293b;
  overflow: hidden;
}

.nova-admin-shell.sidebar-collapsed {
  grid-template-columns: 82px minmax(0, 1fr);
}

.nova-sidebar {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0f172a;
  border-right: 1px solid #1e293b;
  color: #cbd5e1;
  box-shadow: 18px 0 50px rgba(15, 23, 42, 0.14);
  z-index: 30;
}

.brand-block {
  min-height: 82px;
  padding: 22px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-mark {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  color: #ffffff;
  background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
  box-shadow: 0 16px 28px rgba(37, 99, 235, 0.28);
}

.brand-copy,
.admin-identity {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.brand-copy strong,
.admin-identity strong {
  color: #ffffff;
  font-size: 15px;
  letter-spacing: 0;
  white-space: nowrap;
}

.brand-copy span,
.admin-identity span {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0;
  white-space: nowrap;
}

.side-nav {
  flex: 1;
  padding: 10px 12px;
  display: grid;
  align-content: start;
  gap: 6px;
}

.nav-kicker {
  margin: 0 0 8px;
  padding: 0 12px;
  color: #475569;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  transition: opacity 0.18s ease;
}

.nav-kicker.hidden {
  opacity: 0;
}

.side-nav-item {
  min-height: 42px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  border-radius: 8px;
  border-left: 2px solid transparent;
  color: #94a3b8;
  text-decoration: none;
  font-size: 13px;
  font-weight: 800;
  transition: color 0.16s ease, background 0.16s ease, border-color 0.16s ease;
}

.side-nav-item:hover {
  color: #ffffff;
  background: #1e293b;
}

.side-nav-item.active {
  color: #60a5fa;
  background: rgba(37, 99, 235, 0.12);
  border-left-color: #3b82f6;
}

.side-nav-item svg {
  flex: 0 0 auto;
}

.sidebar-footer {
  min-height: 72px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-top: 1px solid #1e293b;
}

.admin-avatar {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: #bfdbfe;
  background: #1e293b;
  border: 1px solid #334155;
}

.logout-link {
  display: inline-grid;
  place-items: center;
  color: #64748b;
  text-decoration: none;
  transition: color 0.16s ease;
}

.logout-link:hover {
  color: #f87171;
}

.nova-main {
  position: relative;
  min-width: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.nova-topbar {
  min-height: 66px;
  padding: 0 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: rgba(255, 255, 255, 0.96);
  border-bottom: 1px solid #e2e8f0;
  backdrop-filter: blur(16px);
}

.topbar-title,
.topbar-actions {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.topbar-title h1,
.topbar-title p {
  margin: 0;
}

.topbar-title p {
  color: #94a3b8;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.topbar-title h1 {
  color: #0f172a;
  font-size: 18px;
  line-height: 1.2;
  letter-spacing: 0;
}

.active-view-icon,
.icon-button {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  display: grid;
  place-items: center;
  border-radius: 10px;
}

.active-view-icon {
  color: #2563eb;
  background: #eff6ff;
  border: 1px solid #dbeafe;
}

.icon-button {
  position: relative;
  border: 0;
  color: #64748b;
  background: transparent;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.16s ease, background 0.16s ease;
}

.icon-button:hover {
  color: #0f172a;
  background: #f1f5f9;
}

.mobile-menu {
  display: none;
}

.system-pill,
.content-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.system-pill {
  padding: 5px 9px;
  background: #dcfce7;
  color: #15803d;
}

.system-pill.warning {
  background: #fef3c7;
  color: #b45309;
}

.system-pill.danger {
  background: #fee2e2;
  color: #b91c1c;
}

.admin-search {
  width: min(320px, 28vw);
  min-width: 220px;
  height: 36px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border-radius: 9px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #94a3b8;
}

.admin-search input {
  min-width: 0;
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #334155;
  font: inherit;
  font-size: 13px;
}

.alert-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #ef4444;
  border: 2px solid #ffffff;
}

.nova-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 24px;
  background:
    linear-gradient(180deg, rgba(248, 250, 252, 0.9) 0%, #eef2f7 100%),
    radial-gradient(circle at 90% 12%, rgba(37, 99, 235, 0.12), transparent 28%);
}

.content-header {
  margin: 0 auto 22px;
  max-width: 1600px;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-end;
}

.content-header p,
.content-header h2 {
  margin: 0;
}

.content-header p {
  color: #2563eb;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.content-header h2 {
  margin-top: 6px;
  color: #475569;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 700;
}

.content-status {
  padding: 8px 10px;
  color: #475569;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.04);
}

.floating-terminal {
  position: absolute;
  right: 24px;
  bottom: 24px;
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  color: #ffffff;
  background: #0f172a;
  box-shadow: 0 24px 44px rgba(15, 23, 42, 0.28);
  text-decoration: none;
  transition: transform 0.16s ease, color 0.16s ease;
}

.floating-terminal:hover {
  color: #60a5fa;
  transform: translateY(-2px);
}

.floating-terminal span {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  border: 3px solid #ffffff;
  background: #2563eb;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

@media (max-width: 1040px) {
  .nova-admin-shell,
  .nova-admin-shell.sidebar-collapsed {
    grid-template-columns: 1fr;
  }

  .nova-sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    width: 248px;
    transform: translateX(-100%);
    transition: transform 0.18s ease;
  }

  .nova-admin-shell:not(.sidebar-collapsed) .nova-sidebar {
    transform: translateX(0);
  }

  .mobile-menu {
    display: grid;
  }

  .desktop-collapse {
    display: none;
  }

  .nova-topbar {
    padding: 0 16px;
  }

  .admin-search {
    display: none;
  }

  .topbar-title h1 {
    font-size: 16px;
  }
}

@media (max-width: 720px) {
  .nova-content {
    padding: 16px;
  }

  .content-header {
    display: grid;
    align-items: start;
  }

  .system-pill,
  .content-status,
  .topbar-actions :deep(.admin-toolbar-label) {
    display: none;
  }
}
</style>
