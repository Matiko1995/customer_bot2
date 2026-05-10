<template>
  <AdminShell
    title="平台运营指挥台"
    subtitle="全局监控真实租户、知识命中、线索和运营风险。"
    eyebrow="全局监控"
  >
    <template #toolbar>
      <button type="button" class="toolbar-export" @click="exportOverview">
        <Download :size="15" />
        <span class="admin-toolbar-label">导出全局报告</span>
      </button>
    </template>

    <div class="command-board">
      <section class="hero-panel">
        <div class="hero-copy">
          <p class="panel-kicker">运营指挥</p>
          <h2>智能客服运营指挥台</h2>
          <p>先看平台健康，再进入租户动作。这里聚合会话、留资、知识命中和待关注租户，适合日常巡检和交付跟进。</p>
        </div>
        <nav class="hero-actions" aria-label="后台快捷入口">
          <NuxtLink to="/admin/tenants">
            <Layers :size="16" />
            租户控制
          </NuxtLink>
          <NuxtLink to="/admin/chats">
            <MessageSquareText :size="16" />
            会话追踪
          </NuxtLink>
          <NuxtLink to="/admin/leads">
            <UserRoundPlus :size="16" />
            留资中心
          </NuxtLink>
          <NuxtLink to="/admin/billing">
            <ReceiptText :size="16" />
            账单运营
          </NuxtLink>
        </nav>
      </section>

      <section class="stat-grid">
        <article class="stat-card">
          <div class="stat-icon blue">
            <MessageSquareText :size="22" />
          </div>
          <div>
            <p>累计会话</p>
            <strong>{{ overview.kpis.todaySessions }}</strong>
            <span>全租户累计会话数</span>
          </div>
        </article>
        <article class="stat-card">
          <div class="stat-icon emerald">
            <UserRoundPlus :size="22" />
          </div>
          <div>
            <p>累计留资</p>
            <strong>{{ overview.kpis.todayLeads }}</strong>
            <span>需要及时回访的潜在线索</span>
          </div>
        </article>
        <article class="stat-card">
          <div class="stat-icon amber">
            <Database :size="22" />
          </div>
          <div>
            <p>资料命中</p>
            <strong>{{ overview.kpis.activeContentHits }}</strong>
            <span>知识资料被使用的活跃度</span>
          </div>
        </article>
        <article class="stat-card dark">
          <div class="stat-icon indigo">
            <TriangleAlert :size="22" />
          </div>
          <div>
            <p>待关注租户</p>
            <strong>{{ overview.kpis.attentionTenants }}</strong>
            <span>停用、超额或命中不足</span>
          </div>
        </article>
      </section>

      <section class="monitor-grid">
        <article class="panel traffic-panel">
          <header class="panel-head">
            <div>
              <p class="panel-kicker">活跃租户流量</p>
              <h3>最近活跃租户</h3>
            </div>
            <NuxtLink to="/admin/tenants" class="inline-action">
              查看全部
              <ChevronRight :size="15" />
            </NuxtLink>
          </header>

          <div class="traffic-list">
            <NuxtLink
              v-for="tenant in overview.recentlyActive"
              :key="tenant.tenantId"
              class="traffic-row"
              :to="`/admin/tenants/${tenant.tenantId}`"
            >
              <div class="traffic-avatar">
                <Users :size="17" />
              </div>
              <div class="traffic-copy">
                <div>
                  <strong>{{ tenant.tenantName }}</strong>
                  <span>{{ tenant.status }}</span>
                </div>
                <div class="traffic-bar">
                  <i :style="{ width: `${resolveActivityWidth(tenant.lastMessageAt)}%` }" />
                </div>
              </div>
              <time>{{ new Date(tenant.lastMessageAt).toLocaleString() }}</time>
            </NuxtLink>
            <p v-if="overview.recentlyActive.length === 0" class="empty-text">当前还没有会话数据。</p>
          </div>
        </article>

        <aside class="panel compute-panel">
          <p class="panel-kicker">算力与命中</p>
          <div class="compute-stack">
            <div>
              <div class="compute-label">
                <strong>{{ healthScore }}%</strong>
                <span>租户健康度</span>
              </div>
              <div class="compute-meter">
                <i :style="{ width: `${healthScore}%` }" />
              </div>
            </div>
            <div>
              <div class="compute-label">
                <strong>{{ knowledgeScore }}%</strong>
                <span>知识命中率</span>
              </div>
              <div class="compute-meter purple">
                <i :style="{ width: `${knowledgeScore}%` }" />
              </div>
            </div>
          </div>
          <footer>
            <Activity :size="15" />
            <span>系统状态</span>
            <em>正常</em>
          </footer>
        </aside>
      </section>

      <section class="lower-grid">
        <article class="panel priority-panel">
          <header class="panel-head">
            <div>
              <p class="panel-kicker">租户队列</p>
              <h3>优先处理租户</h3>
            </div>
            <span class="hint">按风险原因排序</span>
          </header>
          <div class="queue-list">
            <NuxtLink
              v-for="tenant in overview.priorityTenants"
              :key="tenant.tenantId"
              class="queue-item"
              :to="`/admin/tenants/${tenant.tenantId}`"
            >
              <div>
                <strong>{{ tenant.tenantName }}</strong>
                <span>{{ tenant.reason }}</span>
              </div>
              <em :class="tenant.status">{{ tenant.status }}</em>
            </NuxtLink>
            <p v-if="overview.priorityTenants.length === 0" class="empty-text">当前没有需要特别关注的租户。</p>
          </div>
        </article>

        <article class="panel action-panel">
          <header class="panel-head">
            <div>
              <p class="panel-kicker">运营动作</p>
              <h3>今日建议动作</h3>
            </div>
          </header>
          <div class="action-grid">
            <NuxtLink to="/admin/chats" class="action-card">
              <MessageSquareText :size="18" />
              <strong>排查异常会话</strong>
              <p>优先看命中过资料的会话，确认回答是否稳定。</p>
            </NuxtLink>
            <NuxtLink to="/admin/leads" class="action-card">
              <UserRoundPlus :size="18" />
              <strong>跟进新留资</strong>
              <p>检查今日新增线索，避免运营漏跟。</p>
            </NuxtLink>
            <NuxtLink to="/admin/billing" class="action-card">
              <ReceiptText :size="18" />
              <strong>检查账单超额</strong>
              <p>查看套餐超额租户，准备对账和提醒。</p>
            </NuxtLink>
            <NuxtLink to="/admin/tenants" class="action-card">
              <Layers :size="18" />
              <strong>进入租户工作区</strong>
              <p>从队列进入租户详情，处理内容和配置。</p>
            </NuxtLink>
          </div>
        </article>
      </section>
    </div>
  </AdminShell>
</template>

<script setup lang="ts">
import {
  Activity,
  ChevronRight,
  Database,
  Download,
  Layers,
  MessageSquareText,
  ReceiptText,
  TriangleAlert,
  UserRoundPlus,
  Users
} from '../../lib/lucide-icons'

interface CommandCenterOverview {
  kpis: {
    todaySessions: number
    todayLeads: number
    activeContentHits: number
    attentionTenants: number
  }
  recentlyActive: Array<{
    tenantId: string
    tenantName: string
    lastMessageAt: number
    status: 'active' | 'disabled'
  }>
  priorityTenants: Array<{
    tenantId: string
    tenantName: string
    reason: string
    status: 'active' | 'disabled'
  }>
}

const { request } = useAdminApi()
const overview = ref<CommandCenterOverview>({
  kpis: {
    todaySessions: 0,
    todayLeads: 0,
    activeContentHits: 0,
    attentionTenants: 0
  },
  recentlyActive: [],
  priorityTenants: []
})

const healthScore = computed(() => {
  const total = overview.value.recentlyActive.length + overview.value.priorityTenants.length
  if (total === 0) {
    return 100
  }

  return Math.max(36, Math.round(((total - overview.value.priorityTenants.length) / total) * 100))
})

const knowledgeScore = computed(() => {
  const sessions = Math.max(overview.value.kpis.todaySessions, 1)
  return Math.min(100, Math.max(18, Math.round((overview.value.kpis.activeContentHits / sessions) * 28)))
})

async function loadOverview() {
  overview.value = await request<CommandCenterOverview>('/api/admin/overview')
}

function resolveActivityWidth(lastMessageAt: number) {
  const latest = Math.max(...overview.value.recentlyActive.map((item) => item.lastMessageAt), lastMessageAt)
  return Math.max(16, Math.round((lastMessageAt / latest) * 100))
}

function exportOverview() {
  if (process.server) {
    return
  }

  const blob = new Blob([JSON.stringify(overview.value, null, 2)], { type: 'application/json;charset=utf-8' })
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = `admin-overview-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(objectUrl)
}

try {
  await loadOverview()
} catch {
  await navigateTo('/admin/login')
}
</script>

<style scoped>
.command-board {
  max-width: 1600px;
  margin: 0 auto;
  display: grid;
  gap: 22px;
}

.toolbar-export,
.hero-actions a,
.inline-action,
.action-card,
.queue-item,
.traffic-row {
  text-decoration: none;
}

.toolbar-export {
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 13px;
  border: 0;
  border-radius: 10px;
  color: #ffffff;
  background: #2563eb;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.18);
}

.hero-panel,
.panel,
.stat-card {
  border: 1px solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.06);
}

.hero-panel {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-end;
  padding: 28px;
  border-radius: 18px;
}

.hero-copy {
  max-width: 780px;
}

.panel-kicker {
  margin: 0 0 8px;
  color: #2563eb;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.hero-copy h2,
.panel-head h3 {
  margin: 0;
  color: #0f172a;
  letter-spacing: 0;
}

.hero-copy h2 {
  font-size: clamp(28px, 4vw, 48px);
  line-height: 1.04;
}

.hero-copy p:not(.panel-kicker) {
  margin: 12px 0 0;
  color: #64748b;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.hero-actions a,
.inline-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 10px;
  font-weight: 900;
}

.hero-actions a {
  min-height: 40px;
  padding: 0 13px;
  color: #334155;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  gap: 15px;
  align-items: center;
  padding: 18px;
  border-radius: 16px;
}

.stat-card.dark {
  color: #ffffff;
  background: #0f172a;
  border-color: #0f172a;
}

.stat-icon {
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  display: grid;
  place-items: center;
  border-radius: 14px;
}

.stat-icon.blue { color: #2563eb; background: #eff6ff; }
.stat-icon.emerald { color: #059669; background: #ecfdf5; }
.stat-icon.amber { color: #b45309; background: #fffbeb; }
.stat-icon.indigo { color: #93c5fd; background: rgba(37, 99, 235, 0.18); }

.stat-card p,
.stat-card span {
  margin: 0;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.stat-card strong {
  display: block;
  margin: 2px 0 4px;
  color: #0f172a;
  font-size: 30px;
  line-height: 1;
}

.stat-card.dark p,
.stat-card.dark span,
.stat-card.dark strong {
  color: #f8fafc;
}

.monitor-grid,
.lower-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(320px, 0.8fr);
  gap: 20px;
}

.lower-grid {
  grid-template-columns: minmax(320px, 0.8fr) minmax(0, 1.7fr);
}

.panel {
  border-radius: 18px;
  padding: 22px;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.inline-action {
  color: #2563eb;
  font-size: 12px;
}

.traffic-list,
.queue-list,
.compute-stack {
  display: grid;
  gap: 12px;
}

.traffic-row {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) max-content;
  gap: 14px;
  align-items: center;
  padding: 14px;
  border-radius: 14px;
  color: #334155;
  background: #f8fafc;
  border: 1px solid #eef2f7;
}

.traffic-avatar {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  color: #64748b;
  background: #ffffff;
  border: 1px solid #e2e8f0;
}

.traffic-copy {
  min-width: 0;
  display: grid;
  gap: 8px;
}

.traffic-copy > div:first-child {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.traffic-copy strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.traffic-copy span,
.traffic-row time,
.hint {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
}

.traffic-bar,
.compute-meter {
  height: 6px;
  overflow: hidden;
  border-radius: 999px;
  background: #e2e8f0;
}

.traffic-bar i,
.compute-meter i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #2563eb;
}

.compute-panel {
  color: #ffffff;
  background: #0f172a;
  border-color: #0f172a;
  overflow: hidden;
}

.compute-panel .panel-kicker {
  color: #60a5fa;
}

.compute-stack {
  margin-top: 34px;
}

.compute-label {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 8px;
}

.compute-label strong {
  font-size: 28px;
  line-height: 1;
}

.compute-label span,
.compute-panel footer span {
  color: #64748b;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.compute-meter {
  background: #1e293b;
}

.compute-meter i {
  background: #2563eb;
  box-shadow: 0 0 16px rgba(37, 99, 235, 0.5);
}

.compute-meter.purple i {
  background: #8b5cf6;
}

.compute-panel footer {
  margin-top: 36px;
  padding-top: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-top: 1px solid #1e293b;
  color: #22c55e;
}

.compute-panel footer em {
  margin-left: auto;
  padding: 4px 8px;
  border-radius: 999px;
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
  font-size: 10px;
  font-style: normal;
  font-weight: 900;
}

.queue-item {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
  padding: 14px;
  border-radius: 14px;
  color: #334155;
  background: #f8fafc;
  border: 1px solid #eef2f7;
}

.queue-item div {
  display: grid;
  gap: 4px;
}

.queue-item span,
.empty-text {
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
}

.queue-item em {
  padding: 5px 9px;
  border-radius: 999px;
  color: #15803d;
  background: #dcfce7;
  font-size: 10px;
  font-style: normal;
  font-weight: 900;
  text-transform: uppercase;
}

.queue-item em.disabled {
  color: #b91c1c;
  background: #fee2e2;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.action-card {
  min-height: 142px;
  display: grid;
  align-content: start;
  gap: 10px;
  padding: 16px;
  border-radius: 14px;
  color: #334155;
  background: #f8fafc;
  border: 1px solid #eef2f7;
}

.action-card svg {
  color: #2563eb;
}

.action-card strong,
.action-card p {
  margin: 0;
}

.action-card p {
  color: #64748b;
  font-size: 13px;
  line-height: 1.55;
}

@media (max-width: 1180px) {
  .stat-grid,
  .action-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .monitor-grid,
  .lower-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .hero-panel,
  .panel-head {
    display: grid;
    align-items: start;
  }

  .hero-actions {
    justify-content: stretch;
  }

  .hero-actions a,
  .stat-grid,
  .action-grid {
    width: 100%;
    grid-template-columns: 1fr;
  }

  .traffic-row {
    grid-template-columns: 40px minmax(0, 1fr);
  }

  .traffic-row time {
    grid-column: 2;
  }
}
</style>
