<template>
  <main class="tenant-page">
    <header class="hero">
      <div>
        <p class="eyebrow">Tenant Console</p>
        <h1>{{ overview?.tenant.name || '租户后台' }}</h1>
        <p class="hero-copy">这里只展示当前租户自己的运营数据，不会看到其他租户信息。</p>
      </div>
      <div class="hero-meta">
        <span>{{ overview?.user.email }}</span>
        <button type="button" class="logout-btn" @click="logout">退出登录</button>
      </div>
    </header>

    <section v-if="overview?.user.mustChangePassword" class="panel">
      <header class="panel-head">
        <div>
          <h2>首次登录请修改密码</h2>
          <p class="hint">建议客户在收到初始密码后第一时间改成自己的密码。</p>
        </div>
      </header>
      <form class="password-form" @submit.prevent="changePassword">
        <input v-model="currentPassword" type="password" placeholder="当前密码" required />
        <input v-model="nextPassword" type="password" placeholder="新密码" required />
        <button type="submit" :disabled="changingPassword">{{ changingPassword ? '提交中...' : '修改密码' }}</button>
      </form>
    </section>

    <section class="kpi-grid">
      <article class="kpi-card">
        <p>会话数</p>
        <strong>{{ overview?.kpis.sessionCount || 0 }}</strong>
      </article>
      <article class="kpi-card">
        <p>留资数</p>
        <strong>{{ overview?.kpis.leadCount || 0 }}</strong>
      </article>
      <article class="kpi-card">
        <p>资料源</p>
        <strong>{{ overview?.kpis.contentSourceCount || 0 }}</strong>
      </article>
      <article class="kpi-card">
        <p>最近账单</p>
        <strong>{{ overview?.latestBillingSummary?.amount || '0.00' }}</strong>
      </article>
    </section>

    <section class="quick-grid">
      <NuxtLink to="/tenant/chats" class="quick-card">
        <p>聊天记录</p>
        <strong>查看当前租户会话</strong>
        <span>只读查看消息、命中资料和附件截图。</span>
      </NuxtLink>
      <NuxtLink to="/tenant/leads" class="quick-card">
        <p>留资记录</p>
        <strong>查看当前租户线索</strong>
        <span>按最新时间倒序查看姓名、联系方式和需求备注。</span>
      </NuxtLink>
    </section>

    <section class="panel">
      <header class="panel-head">
        <div>
          <h2>最近训练记录</h2>
          <p class="hint">租户只能看到自己的训练消耗。</p>
        </div>
      </header>
      <div v-if="overview?.trainingRuns.length" class="training-grid">
        <article v-for="run in overview.trainingRuns" :key="run.id" class="training-card">
          <strong>{{ new Date(run.createdAt).toLocaleString() }}</strong>
          <p>{{ run.totalTokens }} tokens / {{ run.amount }}</p>
          <span>{{ run.sessionId }}</span>
        </article>
      </div>
      <p v-else class="hint">当前还没有训练记录。</p>
    </section>

    <p v-if="notice" class="notice">{{ notice }}</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </main>
</template>

<script setup lang="ts">
interface TenantOverview {
  tenant: {
    id: string
    name: string
    brandName: string
    contactEmail: string
  }
  user: {
    email: string
    mustChangePassword: boolean
  }
  kpis: {
    sessionCount: number
    leadCount: number
    contentSourceCount: number
  }
  latestBillingSummary: {
    amount: string
  } | null
  trainingRuns: Array<{
    id: string
    createdAt: number
    totalTokens: number
    amount: string
    sessionId: string
  }>
}

const overview = ref<TenantOverview | null>(null)
const currentPassword = ref('')
const nextPassword = ref('')
const changingPassword = ref(false)
const loggingOut = ref(false)
const notice = ref('')
const errorMessage = ref('')
const { request } = useTenantApi()

async function loadOverview() {
  overview.value = await request<TenantOverview>('/api/tenant/overview')
}

async function changePassword() {
  if (changingPassword.value) return
  changingPassword.value = true
  notice.value = ''
  errorMessage.value = ''

  try {
    await request('/api/tenant/change-password', {
      method: 'POST',
      body: {
        currentPassword: currentPassword.value,
        nextPassword: nextPassword.value
      }
    })
    currentPassword.value = ''
    nextPassword.value = ''
    notice.value = '密码已更新'
    await loadOverview()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '修改密码失败'
  } finally {
    changingPassword.value = false
  }
}

async function logout() {
  if (loggingOut.value) return
  loggingOut.value = true

  try {
    await request('/api/tenant/logout', { method: 'POST' })
  } finally {
    loggingOut.value = false
    await navigateTo('/tenant/login')
  }
}

try {
  await loadOverview()
} catch {
  await navigateTo('/tenant/login')
}
</script>

<style scoped>
.tenant-page {
  min-height: 100vh;
  padding: 24px;
  display: grid;
  gap: 20px;
  background: linear-gradient(180deg, #f4f8fb 0%, #eef4f7 100%);
}
.hero, .panel {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #d9e6ed;
  border-radius: 24px;
  padding: 22px;
  box-shadow: 0 16px 40px rgba(36, 76, 96, 0.08);
}
.eyebrow, .hint, .notice, .error {
  margin: 0;
}
.hero {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}
.hero-copy {
  margin: 8px 0 0;
  color: #536c7e;
  line-height: 1.7;
}
.hero-meta {
  display: grid;
  gap: 10px;
}
.logout-btn {
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid #cfdee6;
  background: #f6fafc;
  color: #0c607b;
  font-weight: 700;
}
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}
.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.kpi-card, .training-card {
  padding: 18px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid #d8e7ee;
}
.quick-card {
  padding: 20px;
  border-radius: 22px;
  border: 1px solid #d8e7ee;
  background:
    radial-gradient(circle at top right, rgba(10, 126, 164, 0.14), transparent 34%),
    linear-gradient(180deg, #ffffff 0%, #f7fbfd 100%);
  color: #17394f;
  text-decoration: none;
  box-shadow: 0 16px 40px rgba(36, 76, 96, 0.08);
}
.quick-card p,
.quick-card strong,
.quick-card span {
  display: block;
}
.quick-card p {
  margin: 0;
  color: #0c607b;
  font-weight: 700;
}
.quick-card strong {
  margin-top: 10px;
  font-size: 20px;
}
.quick-card span {
  margin-top: 10px;
  color: #5c7485;
  line-height: 1.7;
}
.kpi-card strong {
  font-size: 32px;
  color: #17394f;
}
.training-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.training-card p,
.training-card span {
  margin: 8px 0 0;
  color: #5c7485;
  word-break: break-all;
}
.password-form {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}
input, button {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #cfd9e2;
  font: inherit;
}
button {
  background: #0a7ea4;
  color: white;
  border: 0;
  font-weight: 700;
}
.notice {
  color: #0c607b;
}
.error {
  color: #b42318;
}
@media (max-width: 980px) {
  .hero,
  .kpi-grid,
  .quick-grid,
  .training-grid,
  .password-form {
    grid-template-columns: 1fr;
  }
}
</style>
