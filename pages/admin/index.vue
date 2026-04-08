<template>
  <main class="command-page">
    <header class="hero">
      <div>
        <p class="eyebrow">Operations Command</p>
        <h1>AI 客服运营指挥台</h1>
        <p class="hero-copy">先看结果，再决定处理谁。这里用于盯盘、识别异常租户、追踪高频内容命中，并快速进入租户工作区。</p>
      </div>
      <nav class="hero-nav">
        <NuxtLink to="/admin/tenants">租户队列</NuxtLink>
        <NuxtLink to="/admin/chats">聊天记录</NuxtLink>
        <NuxtLink to="/admin/leads">留资</NuxtLink>
        <NuxtLink to="/admin/billing">账单</NuxtLink>
      </nav>
    </header>

    <section class="kpi-grid">
      <article class="kpi-card">
        <p class="kpi-label">累计会话</p>
        <strong>{{ overview.kpis.todaySessions }}</strong>
        <span>全租户累计会话数</span>
      </article>
      <article class="kpi-card">
        <p class="kpi-label">累计留资</p>
        <strong>{{ overview.kpis.todayLeads }}</strong>
        <span>需要及时回访的潜在线索</span>
      </article>
      <article class="kpi-card">
        <p class="kpi-label">资料命中</p>
        <strong>{{ overview.kpis.activeContentHits }}</strong>
        <span>反映当前知识资料被使用的活跃度</span>
      </article>
      <article class="kpi-card alert-card">
        <p class="kpi-label">待关注租户</p>
        <strong>{{ overview.kpis.attentionTenants }}</strong>
        <span>停用、超额或命中不足的租户</span>
      </article>
    </section>

    <section class="dashboard-grid">
      <aside class="rail panel">
        <div class="panel-head">
          <div>
            <p class="section-label">Tenant Queue</p>
            <h2>优先处理租户</h2>
          </div>
          <NuxtLink class="inline-link" to="/admin/tenants">查看全部</NuxtLink>
        </div>

        <div class="queue-list">
          <NuxtLink v-for="tenant in overview.priorityTenants" :key="tenant.tenantId" class="queue-item" :to="`/admin/tenants/${tenant.tenantId}`">
            <strong>{{ tenant.tenantName }}</strong>
            <span>{{ tenant.reason }}</span>
            <em :class="tenant.status">{{ tenant.status }}</em>
          </NuxtLink>
          <p v-if="overview.priorityTenants.length === 0" class="empty-text">当前没有需要特别关注的租户。</p>
        </div>
      </aside>

      <div class="main-column">
        <section class="panel trend-panel">
          <div class="panel-head">
            <div>
              <p class="section-label">Live Board</p>
              <h2>最近活跃租户</h2>
            </div>
            <span class="mini-hint">按最近消息时间排序</span>
          </div>

          <div class="activity-list">
            <NuxtLink
              v-for="item in overview.recentlyActive"
              :key="item.tenantId"
              class="activity-item"
              :to="`/admin/tenants/${item.tenantId}`"
            >
              <div>
                <strong>{{ item.tenantName }}</strong>
                <p>{{ new Date(item.lastMessageAt).toLocaleString() }}</p>
              </div>
              <em :class="item.status">{{ item.status }}</em>
            </NuxtLink>
            <p v-if="overview.recentlyActive.length === 0" class="empty-text">当前还没有会话数据。</p>
          </div>
        </section>

        <section class="panel operator-panel">
          <div class="panel-head">
            <div>
              <p class="section-label">Operator Actions</p>
              <h2>今日建议动作</h2>
            </div>
          </div>

          <div class="action-grid">
            <NuxtLink class="action-card" to="/admin/chats">
              <strong>排查异常会话</strong>
              <p>优先看命中过资料的会话，确认回答是否稳定。</p>
            </NuxtLink>
            <NuxtLink class="action-card" to="/admin/leads">
              <strong>跟进新留资</strong>
              <p>检查今日新增线索，避免运营漏跟。</p>
            </NuxtLink>
            <NuxtLink class="action-card" to="/admin/billing">
              <strong>检查账单超额</strong>
              <p>查看套餐超额租户，准备对账和提醒。</p>
            </NuxtLink>
            <NuxtLink class="action-card" to="/admin/tenants">
              <strong>进入租户工作区</strong>
              <p>从队列进入租户详情，处理内容和配置。</p>
            </NuxtLink>
          </div>
        </section>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
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

async function loadOverview() {
  overview.value = await request<CommandCenterOverview>('/api/admin/overview')
}

try {
  await loadOverview()
} catch {
  await navigateTo('/admin/login')
}
</script>

<style scoped>
.command-page {
  min-height: 100vh;
  padding: 24px;
  display: grid;
  gap: 20px;
  background:
    radial-gradient(circle at top left, rgba(20, 110, 140, 0.12), transparent 28%),
    linear-gradient(180deg, #f2f7fb 0%, #edf3f7 100%);
}
.hero, .panel {
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(185, 206, 219, 0.75);
  backdrop-filter: blur(12px);
  box-shadow: 0 18px 60px rgba(38, 70, 89, 0.08);
}
.hero {
  padding: 28px;
  display: grid;
  gap: 18px;
}
.eyebrow, .section-label {
  margin: 0 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 12px;
  color: #0a6f8f;
}
h1, h2 {
  margin: 0;
  color: #12344a;
}
.hero-copy, .mini-hint, .empty-text {
  margin: 8px 0 0;
  color: #4e6678;
  line-height: 1.7;
}
.hero-nav {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.hero-nav a, .inline-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 14px;
  border-radius: 999px;
  background: #f4fafc;
  color: #0f5974;
  text-decoration: none;
  border: 1px solid #cfe1ea;
  font-weight: 700;
}
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}
.kpi-card {
  padding: 18px;
  border-radius: 22px;
  background: #ffffff;
  border: 1px solid #dce8ee;
  display: grid;
  gap: 10px;
}
.kpi-card strong {
  font-size: clamp(28px, 4vw, 42px);
  line-height: 1;
  color: #12344a;
}
.kpi-card span, .kpi-label {
  color: #4e6678;
}
.alert-card {
  background: linear-gradient(135deg, #12344a 0%, #1b596a 100%);
}
.alert-card strong,
.alert-card .kpi-label,
.alert-card span {
  color: #f1f7fa;
}
.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(280px, 0.9fr) minmax(0, 1.6fr);
  gap: 18px;
}
.panel {
  padding: 22px;
}
.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}
.queue-list, .activity-list {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}
.queue-item, .activity-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 14px;
  border-radius: 18px;
  background: #f7fbfc;
  border: 1px solid #d7e6ed;
  text-decoration: none;
}
.queue-item strong, .activity-item strong {
  color: #17394f;
}
.queue-item span, .activity-item p {
  margin: 6px 0 0;
  color: #567082;
}
em {
  font-style: normal;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}
em.active {
  background: #dff5ea;
  color: #116149;
}
em.disabled {
  background: #fde5e1;
  color: #9f2a1e;
}
.main-column {
  display: grid;
  gap: 18px;
}
.trend-panel, .operator-panel {
  display: grid;
  gap: 16px;
}
.action-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.action-card {
  text-decoration: none;
  padding: 18px;
  border-radius: 20px;
  background: linear-gradient(180deg, #ffffff 0%, #f5fafc 100%);
  border: 1px solid #d7e6ed;
  min-height: 120px;
}
.action-card strong {
  display: block;
  color: #12344a;
  margin-bottom: 8px;
}
.action-card p {
  margin: 0;
  color: #557081;
  line-height: 1.7;
}
@media (max-width: 1100px) {
  .kpi-grid,
  .action-grid,
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>
