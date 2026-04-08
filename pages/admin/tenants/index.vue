<template>
  <main class="queue-page">
    <header class="queue-hero">
      <div class="hero-copywriting">
        <NuxtLink class="inline-link" to="/admin">返回指挥台</NuxtLink>
        <p class="eyebrow">Tenant Console</p>
        <h1>租户运营台</h1>
        <p class="hero-copy">把租户管理、模型策略、问答留存和删除治理收拢到一个入口。这里先分流，再进入单租户工作区执行。</p>
      </div>
      <nav class="hero-nav">
        <NuxtLink to="/admin/chats">聊天记录</NuxtLink>
        <NuxtLink to="/admin/leads">留资</NuxtLink>
        <NuxtLink to="/admin/billing">账单</NuxtLink>
      </nav>
    </header>

    <section class="hero-metrics">
      <article class="metric-card">
        <p>有效租户</p>
        <strong>{{ activeTenants.length }}</strong>
        <span>当前可继续服务的租户数</span>
      </article>
      <article class="metric-card">
        <p>关闭归档</p>
        <strong>{{ archivedTenants.length }}</strong>
        <span>软删除后留档，便于审计与恢复</span>
      </article>
      <article class="metric-card">
        <p>开启复用</p>
        <strong>{{ reuseEnabledCount }}</strong>
        <span>相同问题优先复用历史回答</span>
      </article>
    </section>

    <section class="page-grid">
      <section class="panel create-panel">
        <div class="panel-head">
          <div>
            <p class="section-label">Create Tenant</p>
            <h2>新增租户</h2>
            <p class="panel-copy">创建时先确定品牌、联系邮箱和回答复用策略，后续再进入工作区补充模型与知识内容。</p>
          </div>
        </div>
        <form class="create-form" @submit.prevent="createTenant">
          <input v-model.trim="form.name" type="text" placeholder="租户名称" required />
          <input v-model.trim="form.brandName" type="text" placeholder="品牌名称" required />
          <input v-model.trim="form.contactEmail" type="email" placeholder="联系邮箱" />
          <label class="toggle-row">
            <input v-model="form.reuseAnsweredQuestions" type="checkbox" />
            <span>默认启用相同问题复用</span>
          </label>
          <button type="submit" :disabled="submitting">{{ submitting ? '创建中...' : '创建租户' }}</button>
        </form>
        <article v-if="latestCreatedLogin" class="credential-card">
          <p class="section-label">Tenant Login</p>
          <strong>{{ latestCreatedLogin.tenantId }}</strong>
          <p>邮箱：{{ latestCreatedLogin.email }}</p>
          <p>初始密码：{{ latestCreatedLogin.initialPassword }}</p>
        </article>
      </section>

      <section class="panel queue-list">
        <div class="panel-head">
          <div>
            <p class="section-label">Tenant Queue</p>
            <h2>运行中的租户</h2>
            <p class="panel-copy">优先处理活跃租户。卡片直接展示当前状态、复用策略和进入工作区的动作。</p>
          </div>
          <span class="mini-hint">点击进入独立工作区</span>
        </div>

        <div class="tenant-grid">
          <article v-for="tenant in activeTenants" :key="tenant.id" class="tenant-card">
            <div class="tenant-card-head">
              <div>
                <strong>{{ tenant.name }}</strong>
                <p>{{ tenant.brandName }}</p>
              </div>
              <div class="tenant-badges">
                <em :class="tenant.status">{{ tenant.status }}</em>
                <span class="reuse-badge" :class="{ off: tenant.reuseAnsweredQuestions === false }">
                  {{ tenant.reuseAnsweredQuestions === false ? '不复用' : '复用开启' }}
                </span>
              </div>
            </div>
            <dl class="tenant-meta">
              <div>
                <dt>Tenant ID</dt>
                <dd>{{ tenant.id }}</dd>
              </div>
              <div>
                <dt>Embed Key</dt>
                <dd>{{ tenant.embedKey }}</dd>
              </div>
              <div>
                <dt>邮箱</dt>
                <dd>{{ tenant.contactEmail || '-' }}</dd>
              </div>
            </dl>
            <div class="tenant-actions">
              <NuxtLink class="enter-link" :to="`/admin/tenants/${tenant.id}`">进入工作区</NuxtLink>
              <button type="button" class="danger-btn" :disabled="deletingTenantId === tenant.id" @click="softDeleteTenant(tenant)">
                {{ deletingTenantId === tenant.id ? '归档中...' : '软删除' }}
              </button>
            </div>
          </article>
        </div>
      </section>
    </section>

    <section class="panel archive-panel" v-if="archivedTenants.length">
      <div class="panel-head">
        <div>
          <p class="section-label">Archive</p>
          <h2>已归档租户</h2>
          <p class="panel-copy">归档后不会再参与解析或对外服务，但数据仍保留在系统里，便于审计与恢复。</p>
        </div>
      </div>
      <div class="archive-grid">
        <article v-for="tenant in archivedTenants" :key="tenant.id" class="archive-card">
          <strong>{{ tenant.name }}</strong>
          <p>{{ tenant.brandName }}</p>
          <span>归档时间：{{ tenant.deletedAt ? new Date(tenant.deletedAt).toLocaleString() : '-' }}</span>
          <code>{{ tenant.id }}</code>
          <button type="button" class="enter-link" :disabled="restoringTenantId === tenant.id" @click="restoreTenant(tenant)">
            {{ restoringTenantId === tenant.id ? '恢复中...' : '恢复租户' }}
          </button>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import type { TenantRecord } from '../../../types'

const { request } = useAdminApi()
const items = ref<TenantRecord[]>([])
const submitting = ref(false)
const deletingTenantId = ref('')
const restoringTenantId = ref('')
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
.queue-page {
  min-height: 100vh;
  padding: 24px;
  display: grid;
  gap: 20px;
  background:
    radial-gradient(circle at top right, rgba(17, 138, 178, 0.16), transparent 28%),
    linear-gradient(180deg, #f4f8fb 0%, #eef4f7 100%);
}
.hero-copywriting {
  display: grid;
  gap: 10px;
}
.queue-hero,
.panel,
.metric-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #d9e6ed;
  border-radius: 24px;
  padding: 22px;
  box-shadow: 0 16px 40px rgba(36, 76, 96, 0.08);
}
.eyebrow,
.section-label {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 12px;
  color: #0b789b;
}
.queue-hero {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}
.hero-metrics,
.page-grid {
  display: grid;
  grid-template-columns: 1.05fr 1.4fr;
  gap: 18px;
}
.hero-metrics {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.metric-card {
  display: grid;
  gap: 8px;
}
.metric-card p,
.metric-card span {
  margin: 0;
  color: #5a7284;
}
.metric-card strong {
  font-size: 32px;
  color: #17394f;
}
h1,
 h2 {
  margin: 0;
  color: #16384d;
}
.hero-copy,
.panel-copy,
.mini-hint {
  margin: 0;
  color: #536c7e;
  line-height: 1.7;
}
.inline-link,
.hero-nav a,
.enter-link,
.danger-btn,
.create-form button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid #cfdee6;
  background: #f6fafc;
  color: #0c607b;
  font-weight: 700;
  text-decoration: none;
  font: inherit;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.inline-link:hover,
.hero-nav a:hover,
.enter-link:hover,
.danger-btn:hover,
.create-form button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(12, 96, 123, 0.08);
}
.hero-nav {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}
.create-form {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}
.create-form input {
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid #cddde6;
  font: inherit;
  background: #fbfdfe;
}
.toggle-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 16px;
  background: #f4fafc;
  border: 1px solid #dbe8ef;
  color: #305062;
}
.create-form button {
  background: linear-gradient(135deg, #0b789b, #0f93ba);
  color: white;
  border: 0;
}
.credential-card {
  margin-top: 16px;
  padding: 16px;
  border-radius: 18px;
  background: #f7fbfc;
  border: 1px solid #d8e7ee;
  color: #17394f;
}
.credential-card p,
.credential-card strong {
  margin: 4px 0 0;
}
.tenant-grid,
.archive-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 18px;
}
.tenant-card,
.archive-card {
  display: grid;
  gap: 14px;
  padding: 18px;
  border-radius: 20px;
  background: linear-gradient(180deg, #ffffff 0%, #f7fbfc 100%);
  border: 1px solid #d8e7ee;
}
.tenant-card-head,
.tenant-actions,
.tenant-badges {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  flex-wrap: wrap;
}
.tenant-card strong,
.archive-card strong {
  color: #17394f;
  font-size: 18px;
}
.tenant-card p,
.archive-card p,
.archive-card span {
  margin: 4px 0 0;
  color: #607888;
}
.tenant-meta {
  display: grid;
  gap: 10px;
  margin: 0;
}
.tenant-meta div {
  display: grid;
  gap: 4px;
}
.tenant-meta dt {
  color: #6b8494;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.tenant-meta dd,
.archive-card code {
  margin: 0;
  color: #16384d;
  word-break: break-all;
}
em.active,
em.disabled,
.reuse-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 999px;
  font-style: normal;
  font-size: 12px;
  font-weight: 700;
}
em.active {
  background: rgba(33, 166, 117, 0.12);
  color: #14815a;
}
em.disabled {
  background: rgba(167, 92, 92, 0.12);
  color: #9b4242;
}
.reuse-badge {
  background: rgba(11, 120, 155, 0.1);
  color: #0b789b;
}
.reuse-badge.off {
  background: rgba(141, 116, 46, 0.12);
  color: #8a6314;
}
.danger-btn {
  border-color: rgba(181, 74, 74, 0.18);
  color: #a54040;
  background: #fff7f7;
}
.archive-panel {
  border-style: dashed;
}
@media (max-width: 1100px) {
  .page-grid,
  .hero-metrics,
  .tenant-grid,
  .archive-grid {
    grid-template-columns: 1fr;
  }

  .queue-hero {
    flex-direction: column;
  }
}
</style>
