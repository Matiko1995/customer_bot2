<template>
  <AdminShell
    title="账单运营"
    subtitle="按租户检查套餐、月汇总、来源拆分和调用明细。"
    eyebrow="商业监控"
    :status-label="tenantId ? '租户范围' : '等待租户'"
    :status-tone="tenantId ? 'normal' : 'warning'"
  >
    <div class="billing-page">
      <section class="panel billing-hero">
        <div>
          <p class="panel-kicker">账单控制台</p>
          <h2>账单</h2>
          <p>输入租户 ID 查询套餐、月账单、调用明细和模型来源拆分。模型服务商可用于过滤训练或外部模型消耗。</p>
        </div>
        <form class="filter-form" @submit.prevent="loadBilling">
          <label>
            <span>租户 ID</span>
            <input v-model.trim="tenantId" type="text" placeholder="请输入租户 ID" required />
          </label>
          <label>
            <span>模型服务商</span>
            <input v-model.trim="providerFilter" type="text" placeholder="服务商标识，可选" />
          </label>
          <button type="submit">
            <Search :size="16" />
            查询
          </button>
          <button type="button" class="ghost-btn" :disabled="!tenantId" @click="exportBilling">
            <Download :size="16" />
            导出表格
          </button>
        </form>
      </section>

      <section class="metric-grid">
        <article class="metric-card">
          <ReceiptText :size="22" />
          <div>
            <p>账单月份</p>
            <strong>{{ summaries.length }}</strong>
            <span>{{ latestMonth || '暂无月份' }}</span>
          </div>
        </article>
        <article class="metric-card">
          <Gauge :size="22" />
          <div>
            <p>总令牌数</p>
            <strong>{{ totalTokens }}</strong>
            <span>当前查询范围累计</span>
          </div>
        </article>
        <article class="metric-card dark">
          <BadgeDollarSign :size="22" />
          <div>
            <p>应收金额</p>
            <strong>{{ totalAmount }}</strong>
            <span>按月汇总加总</span>
          </div>
        </article>
      </section>

      <section class="panel plan-panel">
        <header class="panel-head">
          <div>
            <p class="panel-kicker">套餐摘要</p>
            <h3>套餐信息</h3>
          </div>
        </header>
        <div v-if="tenant" class="plan-summary">
          <article>
            <span>租户</span>
            <strong>{{ tenant.name }}</strong>
            <p>{{ tenant.id }}</p>
          </article>
          <article>
            <span>当前套餐</span>
            <strong>{{ plan?.name || '未绑定' }}</strong>
            <p v-if="plan">月费 {{ plan.monthlyFee }} / 含 {{ plan.includedTokens }} 个令牌</p>
          </article>
          <article v-if="plan">
            <span>超额单价</span>
            <strong>{{ plan.overagePricePerThousandTokens }}</strong>
            <p>每千个令牌</p>
          </article>
        </div>
        <p v-else class="empty-text">请输入租户 ID 查询账单。</p>
      </section>

      <section class="panel">
        <header class="panel-head">
          <div>
            <p class="panel-kicker">月度汇总</p>
            <h3>月汇总</h3>
          </div>
        </header>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>月份</th>
                <th>输入令牌</th>
                <th>输出令牌</th>
                <th>总令牌</th>
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
        </div>
      </section>

      <section class="panel">
        <header class="panel-head">
          <div>
            <p class="panel-kicker">来源拆分</p>
            <h3>来源拆分</h3>
          </div>
        </header>
        <div v-if="breakdown.length" class="breakdown-grid">
          <article v-for="item in breakdown" :key="`${item.credentialSource}-${item.answerSource}`" class="breakdown-card">
            <div>
              <span>凭据来源</span>
              <strong>{{ item.credentialSource }}</strong>
            </div>
            <div>
              <span>回答来源</span>
              <strong>{{ item.answerSource }}</strong>
            </div>
            <p>{{ item.requestCount }} 次请求 / {{ item.totalTokens }} 个令牌 / {{ item.amount }}</p>
          </article>
        </div>
        <p v-else class="empty-text">当前没有可展示的来源拆分。</p>
      </section>

      <section class="panel">
        <header class="panel-head">
          <div>
            <p class="panel-kicker">调用明细</p>
            <h3>调用明细</h3>
          </div>
          <span>{{ filteredUsageRecords.length }} 条</span>
        </header>
        <div class="table-wrap">
          <table class="data-table usage-table">
            <thead>
              <tr>
                <th>时间</th>
                <th>来源</th>
                <th>凭据</th>
                <th>回答链路</th>
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
                <td>{{ item.credentialSource || '-' }}</td>
                <td>{{ item.answerSource || '-' }}</td>
                <td>{{ item.model }}</td>
                <td>{{ item.sessionId }}</td>
                <td>{{ item.inputTokens }}</td>
                <td>{{ item.outputTokens }}</td>
                <td>{{ item.totalTokens }}</td>
                <td>{{ item.amount }}</td>
                <td><span class="status-pill">{{ formatUsageStatus(item.status) }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </AdminShell>
</template>

<script setup lang="ts">
import { BadgeDollarSign, Download, Gauge, ReceiptText, Search } from '../../lib/lucide-icons'
import type { BillingPlan, BillingSummary, LlmUsageRecord, TenantRecord } from '../../types'

type UsageBreakdownItem = {
  credentialSource: string
  answerSource: string
  totalTokens: number
  amount: string
  requestCount: number
}

const route = useRoute()
const { request } = useAdminApi()
const tenantId = ref(typeof route.query.tenantId === 'string' ? route.query.tenantId : '')
const providerFilter = ref(typeof route.query.provider === 'string' ? route.query.provider : '')
const summaries = ref<BillingSummary[]>([])
const usageRecords = ref<LlmUsageRecord[]>([])
const breakdown = ref<UsageBreakdownItem[]>([])
const tenant = ref<TenantRecord | null>(null)
const plan = ref<BillingPlan | null>(null)
const filteredUsageRecords = computed(() => {
  if (!providerFilter.value) {
    return usageRecords.value
  }

  return usageRecords.value.filter((item) => item.provider === providerFilter.value)
})
const totalTokens = computed(() => summaries.value.reduce((sum, item) => sum + item.totalTokens, 0))
const totalAmount = computed(() => summaries.value.reduce((sum, item) => sum + Number(item.amount || 0), 0).toFixed(2))
const latestMonth = computed(() => summaries.value.map((item) => item.month).sort().at(-1) || '')

function formatUsageStatus(status: string) {
  const labels: Record<string, string> = {
    success: '成功',
    failed: '失败',
    pending: '处理中'
  }

  return labels[status] || status
}

async function loadBilling() {
  if (!tenantId.value) return
  const response = await request<{ summaries: BillingSummary[]; usageRecords: LlmUsageRecord[]; breakdown: UsageBreakdownItem[]; tenant?: TenantRecord | null; plan?: BillingPlan | null }>(
    `/api/admin/billing?tenantId=${encodeURIComponent(tenantId.value)}`
  )
  summaries.value = response.summaries
  usageRecords.value = response.usageRecords
  breakdown.value = response.breakdown
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
.billing-page {
  max-width: 1600px;
  margin: 0 auto;
  display: grid;
  gap: 22px;
}

.panel,
.metric-card {
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.06);
}

.panel {
  padding: 22px;
}

.billing-hero {
  display: grid;
  grid-template-columns: minmax(280px, 0.72fr) minmax(0, 1.28fr);
  gap: 22px;
  align-items: end;
}

.panel-kicker {
  margin: 0 0 8px;
  color: #2563eb;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

h2,
h3 {
  margin: 0;
  color: #0f172a;
}

.billing-hero p:not(.panel-kicker),
.empty-text {
  margin: 10px 0 0;
  color: #64748b;
  line-height: 1.7;
}

.filter-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr)) auto auto;
  gap: 12px;
  align-items: end;
}

.filter-form label {
  display: grid;
  gap: 8px;
}

.filter-form label span {
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

input {
  padding: 0 12px;
  color: #334155;
  background: #f8fafc;
}

button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  border: 0;
  color: #ffffff;
  background: #2563eb;
  font-weight: 900;
  cursor: pointer;
}

.ghost-btn {
  color: #334155;
  background: #ffffff;
  border: 1px solid #cbd5e1;
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

.metric-card.dark {
  color: #ffffff;
  background: #0f172a;
  border-color: #0f172a;
}

.metric-card svg {
  width: 48px;
  height: 48px;
  padding: 12px;
  border-radius: 14px;
  color: #2563eb;
  background: #eff6ff;
}

.metric-card.dark svg {
  color: #93c5fd;
  background: rgba(37, 99, 235, 0.18);
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
}

.metric-card.dark p,
.metric-card.dark span,
.metric-card.dark strong {
  color: #f8fafc;
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

.plan-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.plan-summary article,
.breakdown-card {
  padding: 16px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.plan-summary span,
.breakdown-card span {
  color: #94a3b8;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.plan-summary strong,
.breakdown-card strong {
  display: block;
  margin-top: 6px;
  color: #0f172a;
}

.plan-summary p,
.breakdown-card p {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}

.table-wrap {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  min-width: 980px;
  border-collapse: collapse;
}

.usage-table {
  min-width: 1280px;
}

.data-table th,
.data-table td {
  padding: 14px 12px;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
  vertical-align: top;
}

.data-table th {
  color: #94a3b8;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.data-table td {
  color: #334155;
  font-size: 13px;
}

.breakdown-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.breakdown-card {
  display: grid;
  gap: 10px;
}

.status-pill {
  display: inline-flex;
  padding: 5px 9px;
  border-radius: 999px;
  color: #15803d;
  background: #dcfce7;
  font-size: 11px;
  font-weight: 900;
}

@media (max-width: 1180px) {
  .billing-hero,
  .filter-form,
  .metric-grid,
  .plan-summary,
  .breakdown-grid {
    grid-template-columns: 1fr;
  }
}
</style>
