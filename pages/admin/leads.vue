<template>
  <AdminShell
    title="留资中心"
    subtitle="按租户查询留资，快速判断回访优先级。"
    eyebrow="线索运营"
    :status-label="tenantId ? '租户范围' : '等待租户'"
    :status-tone="tenantId ? 'normal' : 'warning'"
  >
    <div class="lead-page">
      <section class="panel lead-hero">
        <div>
          <p class="panel-kicker">线索控制台</p>
          <h2>留资记录</h2>
          <p>输入租户 ID 查询客户姓名、公司、联系方式、需求类型和备注，用于交付后的人工跟进。</p>
        </div>
        <form class="filter-form" @submit.prevent="loadLeads">
          <label>
            <span>租户 ID</span>
            <input v-model.trim="tenantId" type="text" placeholder="请输入租户 ID" required />
          </label>
          <button type="submit">
            <Search :size="16" />
            查询
          </button>
        </form>
      </section>

      <section class="metric-grid">
        <article class="metric-card">
          <UserRoundPlus :size="22" />
          <div>
            <p>留资数量</p>
            <strong>{{ items.length }}</strong>
            <span>当前租户累计线索</span>
          </div>
        </article>
        <article class="metric-card">
          <Building2 :size="22" />
          <div>
            <p>公司数量</p>
            <strong>{{ uniqueCompanyCount }}</strong>
            <span>去重后的公司/组织</span>
          </div>
        </article>
        <article class="metric-card">
          <ClipboardList :size="22" />
          <div>
            <p>需求类型</p>
            <strong>{{ demandTypes.length }}</strong>
            <span>{{ demandTypes.join(' / ') || '暂无类型' }}</span>
          </div>
        </article>
      </section>

      <section class="panel table-panel">
        <header class="panel-head">
          <div>
            <p class="panel-kicker">线索表格</p>
            <h3>线索明细</h3>
          </div>
          <span>{{ items.length }} 条记录</span>
        </header>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>姓名</th>
                <th>公司</th>
                <th>联系方式</th>
                <th>需求类型</th>
                <th>备注</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.id">
                <td>{{ item.name }}</td>
                <td>{{ item.company }}</td>
                <td>{{ item.contact }}</td>
                <td><span class="type-pill">{{ item.demandType || '-' }}</span></td>
                <td>{{ item.message }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="tenantId && items.length === 0" class="empty-text">当前租户暂无留资记录。</p>
      </section>
    </div>
  </AdminShell>
</template>

<script setup lang="ts">
import { Building2, ClipboardList, Search, UserRoundPlus } from '../../lib/lucide-icons'
import type { LeadRecord } from '../../types'

const route = useRoute()
const { request } = useAdminApi()
const tenantId = ref(typeof route.query.tenantId === 'string' ? route.query.tenantId : '')
const items = ref<LeadRecord[]>([])
const uniqueCompanyCount = computed(() => new Set(items.value.map((item) => item.company).filter(Boolean)).size)
const demandTypes = computed(() => Array.from(new Set(items.value.map((item) => item.demandType).filter(Boolean))).slice(0, 4))

async function loadLeads() {
  if (!tenantId.value) return
  const response = await request<{ items: LeadRecord[] }>(`/api/admin/leads?tenantId=${encodeURIComponent(tenantId.value)}`)
  items.value = response.items
}

if (tenantId.value) {
  await loadLeads()
}
</script>

<style scoped>
.lead-page {
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

.lead-hero {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) minmax(320px, 0.6fr);
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

.lead-hero p:not(.panel-kicker),
.empty-text {
  margin: 10px 0 0;
  color: #64748b;
  line-height: 1.7;
}

.filter-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
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

.table-wrap {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
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
  line-height: 1.6;
}

.type-pill {
  display: inline-flex;
  padding: 5px 9px;
  border-radius: 999px;
  color: #2563eb;
  background: #eff6ff;
  font-size: 11px;
  font-weight: 900;
}

@media (max-width: 980px) {
  .lead-hero,
  .filter-form,
  .metric-grid {
    grid-template-columns: 1fr;
  }
}
</style>
