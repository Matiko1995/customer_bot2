<template>
  <main class="admin-page">
    <header class="panel">
      <NuxtLink to="/admin/tenants">返回租户</NuxtLink>
      <h1>账单</h1>
      <form class="filter" @submit.prevent="loadBilling">
        <input v-model.trim="tenantId" type="text" placeholder="tenantId" required />
        <input v-model.trim="providerFilter" type="text" placeholder="provider，可选" />
        <button type="submit">查询</button>
        <button type="button" class="ghost-btn" :disabled="!tenantId" @click="exportBilling">导出 CSV</button>
      </form>
    </header>

    <section class="panel">
      <h2>套餐信息</h2>
      <div v-if="tenant" class="plan-summary">
        <p><strong>租户</strong> {{ tenant.name }}（{{ tenant.id }}）</p>
        <p><strong>当前套餐</strong> {{ plan?.name || '未绑定' }}</p>
        <p v-if="plan"><strong>月费</strong> {{ plan.monthlyFee }} / <strong>包含 Tokens</strong> {{ plan.includedTokens }} / <strong>超额单价</strong> {{ plan.overagePricePerThousandTokens }} / 1k tokens</p>
      </div>
      <p v-else class="empty-text">请输入租户 ID 查询账单。</p>
    </section>

    <section class="panel">
      <h2>月汇总</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th>月份</th>
            <th>输入 Tokens</th>
            <th>输出 Tokens</th>
            <th>总 Tokens</th>
            <th>套餐内</th>
            <th>超额</th>
            <th>基础费</th>
            <th>超额费</th>
            <th>应收金额</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in summaries" :key="`${item.tenantId}-${item.month}`">
            <td>{{ item.month }}</td>
            <td>{{ item.inputTokens }}</td>
            <td>{{ item.outputTokens }}</td>
            <td>{{ item.totalTokens }}</td>
            <td>{{ item.includedTokens }}</td>
            <td>{{ item.billableTokens }}</td>
            <td>{{ item.baseFee }}</td>
            <td>{{ item.overageFee }}</td>
            <td>{{ item.amount }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="panel">
      <h2>调用明细</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th>时间</th>
            <th>来源</th>
            <th>模型</th>
            <th>会话 / 任务</th>
            <th>输入</th>
            <th>输出</th>
            <th>总量</th>
            <th>金额</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredUsageRecords" :key="item.id">
            <td>{{ new Date(item.createdAt).toLocaleString() }}</td>
            <td>{{ item.provider }}</td>
            <td>{{ item.model }}</td>
            <td>{{ item.sessionId }}</td>
            <td>{{ item.inputTokens }}</td>
            <td>{{ item.outputTokens }}</td>
            <td>{{ item.totalTokens }}</td>
            <td>{{ item.amount }}</td>
            <td>{{ item.status }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </main>
</template>

<script setup lang="ts">
import type { BillingPlan, BillingSummary, LlmUsageRecord, TenantRecord } from '../../types'

const route = useRoute()
const { request } = useAdminApi()
const tenantId = ref(typeof route.query.tenantId === 'string' ? route.query.tenantId : '')
const providerFilter = ref(typeof route.query.provider === 'string' ? route.query.provider : '')
const summaries = ref<BillingSummary[]>([])
const usageRecords = ref<LlmUsageRecord[]>([])
const tenant = ref<TenantRecord | null>(null)
const plan = ref<BillingPlan | null>(null)
const filteredUsageRecords = computed(() => {
  if (!providerFilter.value) {
    return usageRecords.value
  }

  return usageRecords.value.filter((item) => item.provider === providerFilter.value)
})

async function loadBilling() {
  if (!tenantId.value) return
  const response = await request<{ summaries: BillingSummary[]; usageRecords: LlmUsageRecord[]; tenant?: TenantRecord | null; plan?: BillingPlan | null }>(
    `/api/admin/billing?tenantId=${encodeURIComponent(tenantId.value)}`
  )
  summaries.value = response.summaries
  usageRecords.value = response.usageRecords
  tenant.value = response.tenant || null
  plan.value = response.plan || null
}

async function exportBilling() {
  if (!tenantId.value) {
    return
  }

  const response = await fetch(`/api/admin/billing?tenantId=${encodeURIComponent(tenantId.value)}&format=csv`, {
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('导出账单失败')
  }

  const csv = await response.text()
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = `${tenantId.value}-billing.csv`
  anchor.click()
  URL.revokeObjectURL(objectUrl)
}

if (tenantId.value) {
  await loadBilling()
}
</script>

<style scoped>
.admin-page { padding: 24px; min-height: 100vh; display: grid; gap: 20px; background: #f5f9fc; }
.panel { background: white; border-radius: 18px; padding: 20px; }
.filter { display: flex; gap: 12px; }
input, button { padding: 12px; border-radius: 12px; border: 1px solid #cfd9e2; font: inherit; }
button { background: #0a7ea4; color: white; border: 0; font-weight: 700; }
.ghost-btn { background: white; color: #21425b; border: 1px solid #cfd9e2; }
.plan-summary, .empty-text { margin: 0; line-height: 1.7; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 12px; border-bottom: 1px solid #edf2f7; text-align: left; }
@media (max-width: 900px) { .filter { flex-wrap: wrap; } }
</style>
