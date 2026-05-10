<template>
  <AdminShell
    title="租户控制"
    subtitle="运行租户、创建交付、归档恢复都在同一个控制台处理。"
    eyebrow="租户控制台"
  >
    <div class="tenant-console">
      <section class="tenant-hero">
        <div>
          <p class="panel-kicker">租户队列</p>
          <h2>租户运营台</h2>
          <p>队列优先展示可服务租户，创建与归档作为辅助动作保留。点击租户即可进入独立工作区继续处理内容、会话、账单和安装配置。</p>
        </div>
        <div class="tenant-search">
          <Search :size="16" />
          <input v-model.trim="searchKeyword" type="search" placeholder="搜索租户、品牌、邮箱或租户 ID" />
        </div>
      </section>

      <section class="metric-grid">
        <article class="metric-card">
          <Users :size="22" />
          <div>
            <p>有效租户</p>
            <strong>{{ activeTenants.length }}</strong>
            <span>当前可继续服务的租户数</span>
          </div>
        </article>
        <article class="metric-card">
          <ArchiveRestore :size="22" />
          <div>
            <p>关闭归档</p>
            <strong>{{ archivedTenants.length }}</strong>
            <span>软删除后保留审计记录</span>
          </div>
        </article>
        <article class="metric-card">
          <Repeat2 :size="22" />
          <div>
            <p>开启复用</p>
            <strong>{{ reuseEnabledCount }}</strong>
            <span>相同问题优先复用历史回答</span>
          </div>
        </article>
      </section>

      <section class="tenant-layout">
        <aside class="panel create-panel">
          <header>
            <p class="panel-kicker">新增租户</p>
            <h3>新增租户</h3>
            <p>先确定品牌、联系邮箱和回答复用策略，创建后进入工作区补充模型与知识内容。</p>
          </header>
          <form class="create-form" @submit.prevent="createTenant">
            <label>
              <span>租户名称</span>
              <input v-model.trim="form.name" type="text" placeholder="租户名称" required />
            </label>
            <label>
              <span>品牌名称</span>
              <input v-model.trim="form.brandName" type="text" placeholder="品牌名称" required />
            </label>
            <label>
              <span>联系邮箱</span>
              <input v-model.trim="form.contactEmail" type="email" placeholder="联系邮箱" />
            </label>
            <label class="switch-row">
              <input v-model="form.reuseAnsweredQuestions" type="checkbox" />
              <span>默认启用相同问题复用</span>
            </label>
            <button type="submit" :disabled="submitting">
              <Plus :size="16" />
              {{ submitting ? '创建中...' : '创建租户' }}
            </button>
          </form>
          <article v-if="latestCreatedLogin" class="credential-card">
            <p class="panel-kicker">租户登录信息</p>
            <strong>{{ latestCreatedLogin.tenantId }}</strong>
            <span>邮箱：{{ latestCreatedLogin.email }}</span>
            <span>初始密码：{{ latestCreatedLogin.initialPassword }}</span>
          </article>
        </aside>

        <section class="panel queue-panel">
          <header class="panel-head">
            <div>
              <p class="panel-kicker">运行租户</p>
              <h3>运行中的租户</h3>
            </div>
            <span>{{ filteredActiveTenants.length }} / {{ activeTenants.length }}</span>
          </header>

          <div class="tenant-grid">
            <article v-for="tenant in filteredActiveTenants" :key="tenant.id" class="tenant-card">
              <div class="tenant-card-head">
                <div class="tenant-avatar">{{ tenant.name.slice(0, 1).toUpperCase() }}</div>
                <div>
                  <strong>{{ tenant.name }}</strong>
                  <p>{{ tenant.brandName }}</p>
                </div>
                <div class="tenant-badges">
                  <em :class="tenant.status">{{ formatTenantStatus(tenant.status) }}</em>
                  <span :class="{ off: tenant.reuseAnsweredQuestions === false }">
                    {{ tenant.reuseAnsweredQuestions === false ? '不复用' : '复用开启' }}
                  </span>
                </div>
              </div>
              <dl class="tenant-meta">
                <div>
                  <dt>租户 ID</dt>
                  <dd>{{ tenant.id }}</dd>
                </div>
                <div>
                  <dt>嵌入密钥</dt>
                  <dd>{{ tenant.embedKey }}</dd>
                </div>
                <div>
                  <dt>邮箱</dt>
                  <dd>{{ tenant.contactEmail || '-' }}</dd>
                </div>
              </dl>
              <div class="health-row">
                <span>节点健康</span>
                <div><i :style="{ width: `${tenant.status === 'active' ? 96 : 18}%` }" /></div>
              </div>
              <div class="tenant-actions">
                <NuxtLink class="enter-link" :to="`/admin/tenants/${tenant.id}`">
                  进入工作区
                  <ChevronRight :size="15" />
                </NuxtLink>
                <button type="button" class="danger-btn" :disabled="deletingTenantId === tenant.id" @click="softDeleteTenant(tenant)">
                  <Trash2 :size="15" />
                  {{ deletingTenantId === tenant.id ? '归档中...' : '软删除' }}
                </button>
              </div>
            </article>
            <p v-if="filteredActiveTenants.length === 0" class="empty-text">当前筛选条件下没有运行租户。</p>
          </div>
        </section>
      </section>

      <section v-if="filteredArchivedTenants.length" class="panel archive-panel">
        <header class="panel-head">
          <div>
            <p class="panel-kicker">归档区</p>
            <h3>已归档租户</h3>
          </div>
          <span>{{ filteredArchivedTenants.length }} 个归档</span>
        </header>
        <div class="archive-grid">
          <article v-for="tenant in filteredArchivedTenants" :key="tenant.id" class="archive-card">
            <strong>{{ tenant.name }}</strong>
            <p>{{ tenant.brandName }}</p>
            <span>归档时间：{{ tenant.deletedAt ? new Date(tenant.deletedAt).toLocaleString() : '-' }}</span>
            <code>{{ tenant.id }}</code>
            <button type="button" :disabled="restoringTenantId === tenant.id" @click="restoreTenant(tenant)">
              <RotateCcw :size="15" />
              {{ restoringTenantId === tenant.id ? '恢复中...' : '恢复租户' }}
            </button>
          </article>
        </div>
      </section>
    </div>
  </AdminShell>
</template>

<script setup lang="ts">
import { ArchiveRestore, ChevronRight, Plus, Repeat2, RotateCcw, Search, Trash2, Users } from '../../../lib/lucide-icons'
import type { TenantRecord } from '../../../types'

const route = useRoute()
const { request } = useAdminApi()
const items = ref<TenantRecord[]>([])
const submitting = ref(false)
const deletingTenantId = ref('')
const restoringTenantId = ref('')
const searchKeyword = ref(typeof route.query.q === 'string' ? route.query.q : '')
const latestCreatedLogin = ref<{ tenantId: string; email: string; initialPassword: string } | null>(null)
const form = reactive({
  name: '',
  brandName: '',
  contactEmail: '',
  reuseAnsweredQuestions: true
})

const activeTenants = computed(() => items.value.filter((item) => !item.deletedAt))
const archivedTenants = computed(() => items.value.filter((item) => Boolean(item.deletedAt)))
const reuseEnabledCount = computed(() => activeTenants.value.filter((item) => item.reuseAnsweredQuestions !== false).length)
const normalizedSearch = computed(() => searchKeyword.value.trim().toLowerCase())
const filteredActiveTenants = computed(() => filterTenants(activeTenants.value))
const filteredArchivedTenants = computed(() => filterTenants(archivedTenants.value))

function filterTenants(source: TenantRecord[]) {
  const keyword = normalizedSearch.value
  if (!keyword) {
    return source
  }

  return source.filter((tenant) =>
    [tenant.id, tenant.name, tenant.brandName, tenant.contactEmail, tenant.embedKey]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(keyword))
  )
}

function formatTenantStatus(status: string) {
  if (status === 'active') {
    return '运行中'
  }

  if (status === 'disabled') {
    return '已停用'
  }

  return status || '未知'
}

async function loadTenants() {
  const response = await request<{ items: TenantRecord[] }>('/api/admin/tenants?includeDeleted=1')
  items.value = response.items
}

async function createTenant() {
  if (submitting.value) {
    return
  }
  submitting.value = true
  try {
    const response = await request<{ item: TenantRecord; tenantLogin?: { email: string; initialPassword: string } }>('/api/admin/tenants', {
      method: 'POST',
      body: {
        name: form.name,
        brandName: form.brandName,
        contactEmail: form.contactEmail,
        reuseAnsweredQuestions: form.reuseAnsweredQuestions
      }
    })
    if (response.tenantLogin) {
      latestCreatedLogin.value = {
        tenantId: response.item.id,
        email: response.tenantLogin.email,
        initialPassword: response.tenantLogin.initialPassword
      }
    }
    form.name = ''
    form.brandName = ''
    form.contactEmail = ''
    form.reuseAnsweredQuestions = true
    await navigateTo(`/admin/tenants/${response.item.id}`)
  } finally {
    submitting.value = false
  }
}

async function restoreTenant(tenant: TenantRecord) {
  if (restoringTenantId.value) {
    return
  }

  restoringTenantId.value = tenant.id
  try {
    await request(`/api/admin/tenants/${tenant.id}/restore`, { method: 'POST' })
    await loadTenants()
  } finally {
    restoringTenantId.value = ''
  }
}

async function softDeleteTenant(tenant: TenantRecord) {
  if (deletingTenantId.value) {
    return
  }

  const confirmed = window.confirm(`确认将租户「${tenant.name}」软删除吗？删除后将停止对外服务，但数据会保留。`)
  if (!confirmed) {
    return
  }

  deletingTenantId.value = tenant.id
  try {
    await request(`/api/admin/tenants/${tenant.id}`, { method: 'DELETE' })
    await loadTenants()
  } finally {
    deletingTenantId.value = ''
  }
}

try {
  await loadTenants()
} catch {
  await navigateTo('/admin/login')
}
</script>

<style scoped>
.tenant-console {
  max-width: 1600px;
  margin: 0 auto;
  display: grid;
  gap: 22px;
}

.tenant-hero,
.panel,
.metric-card {
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.06);
}

.tenant-hero {
  padding: 28px;
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-end;
}

.tenant-hero > div:first-child {
  max-width: 760px;
}

.panel-kicker {
  margin: 0 0 8px;
  color: #2563eb;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.tenant-hero h2,
.panel h3 {
  margin: 0;
  color: #0f172a;
}

.tenant-hero h2 {
  font-size: clamp(28px, 4vw, 44px);
}

.tenant-hero p:not(.panel-kicker),
.create-panel header p,
.empty-text {
  margin: 10px 0 0;
  color: #64748b;
  line-height: 1.7;
}

.tenant-search {
  width: min(420px, 100%);
  height: 44px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border-radius: 12px;
  color: #94a3b8;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.tenant-search input {
  min-width: 0;
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #334155;
  font: inherit;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.metric-card {
  padding: 18px;
  display: flex;
  gap: 14px;
  align-items: center;
}

.metric-card svg {
  width: 48px;
  height: 48px;
  padding: 12px;
  border-radius: 14px;
  color: #2563eb;
  background: #eff6ff;
}

.metric-card p,
.metric-card span {
  margin: 0;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.metric-card strong {
  display: block;
  color: #0f172a;
  font-size: 30px;
  line-height: 1;
}

.tenant-layout {
  display: grid;
  grid-template-columns: minmax(290px, 0.74fr) minmax(0, 1.55fr);
  gap: 20px;
  align-items: start;
}

.panel {
  padding: 22px;
}

.create-panel,
.create-form {
  display: grid;
  gap: 16px;
}

.create-form label,
.credential-card {
  display: grid;
  gap: 8px;
}

.create-form label span {
  color: #475569;
  font-size: 12px;
  font-weight: 900;
}

input,
button {
  min-height: 42px;
  border-radius: 11px;
  border: 1px solid #cbd5e1;
  font: inherit;
}

.create-form input {
  padding: 0 12px;
  color: #334155;
  background: #f8fafc;
}

button,
.enter-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 900;
  cursor: pointer;
}

.create-form button {
  border: 0;
  color: #ffffff;
  background: #2563eb;
}

.switch-row {
  min-height: 46px;
  display: flex !important;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.switch-row input {
  min-height: 0;
  width: 16px;
  height: 16px;
}

.credential-card {
  padding: 14px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #475569;
  font-size: 13px;
}

.credential-card strong {
  color: #0f172a;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.panel-head span {
  color: #64748b;
  font-size: 12px;
  font-weight: 900;
}

.tenant-grid,
.archive-grid {
  display: grid;
  gap: 14px;
}

.tenant-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.tenant-card,
.archive-card {
  display: grid;
  gap: 14px;
  padding: 16px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.tenant-card-head {
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr) max-content;
  gap: 12px;
  align-items: center;
}

.tenant-avatar {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  color: #ffffff;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  font-weight: 900;
}

.tenant-card-head strong,
.archive-card strong {
  display: block;
  overflow: hidden;
  color: #0f172a;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tenant-card-head p,
.archive-card p,
.archive-card span {
  margin: 3px 0 0;
  color: #64748b;
  font-size: 12px;
}

.tenant-badges {
  display: grid;
  justify-items: end;
  gap: 6px;
}

.tenant-badges em,
.tenant-badges span {
  padding: 5px 8px;
  border-radius: 999px;
  color: #15803d;
  background: #dcfce7;
  font-size: 10px;
  font-style: normal;
  font-weight: 900;
  text-transform: uppercase;
}

.tenant-badges em.disabled,
.tenant-badges span.off {
  color: #b45309;
  background: #fef3c7;
}

.tenant-meta {
  display: grid;
  gap: 8px;
  margin: 0;
}

.tenant-meta div {
  min-width: 0;
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  gap: 10px;
}

.tenant-meta dt {
  color: #94a3b8;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.tenant-meta dd {
  margin: 0;
  overflow: hidden;
  color: #334155;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 800;
}

.health-row {
  display: grid;
  gap: 8px;
}

.health-row span {
  color: #94a3b8;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.health-row div {
  height: 6px;
  overflow: hidden;
  border-radius: 999px;
  background: #e2e8f0;
}

.health-row i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #2563eb;
}

.tenant-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.enter-link,
.archive-card button {
  min-height: 38px;
  padding: 0 12px;
  border-radius: 10px;
  color: #ffffff;
  background: #0f172a;
  text-decoration: none;
  border: 0;
}

.danger-btn {
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid #fecdd3;
  color: #be123c;
  background: #fff1f2;
}

.archive-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.archive-card code {
  overflow: hidden;
  color: #334155;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
}

@media (max-width: 1180px) {
  .tenant-layout,
  .tenant-grid,
  .archive-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .tenant-hero,
  .metric-grid,
  .panel-head,
  .tenant-card-head {
    display: grid;
    grid-template-columns: 1fr;
  }

  .tenant-badges {
    justify-items: start;
  }
}
</style>
