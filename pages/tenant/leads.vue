<template>
  <main class="tenant-page">
    <header class="hero">
      <div>
        <NuxtLink to="/tenant" class="back-link">返回租户首页</NuxtLink>
        <p class="eyebrow">Readonly Leads</p>
        <h1>留资记录</h1>
        <p class="hero-copy">客户只能查看自己租户收到的线索，不支持编辑、导出或删除。</p>
      </div>
      <div class="hero-stat">
        <strong>{{ items.length }}</strong>
        <span>条线索</span>
      </div>
    </header>

    <section v-if="items.length" class="lead-grid">
      <article v-for="item in items" :key="item.id" class="lead-card">
        <header class="lead-head">
          <div>
            <h2>{{ item.name || '未填写姓名' }}</h2>
            <p>{{ item.company || '未填写公司' }}</p>
          </div>
          <span>{{ formatDate(item.createdAt) }}</span>
        </header>
        <dl class="lead-detail">
          <div>
            <dt>联系方式</dt>
            <dd>{{ item.contact || '-' }}</dd>
          </div>
          <div>
            <dt>需求类型</dt>
            <dd>{{ item.demandType || '-' }}</dd>
          </div>
          <div>
            <dt>会话 ID</dt>
            <dd>{{ item.sessionId }}</dd>
          </div>
        </dl>
        <section class="lead-note">
          <p class="note-title">需求备注</p>
          <p>{{ item.message || '暂无备注' }}</p>
        </section>
      </article>
    </section>

    <section v-else class="panel empty-panel">
      <h2>当前还没有留资记录</h2>
      <p>当访客在咨询中提交联系方式或需求时，会在这里按最新时间展示。</p>
    </section>
  </main>
</template>

<script setup lang="ts">
import type { LeadRecord } from '../../types'

const items = ref<LeadRecord[]>([])
const { request } = useTenantApi()

function formatDate(value: number) {
  return new Date(value).toLocaleString()
}

async function loadLeads() {
  const response = await request<{ items: LeadRecord[] }>('/api/tenant/leads')
  items.value = response.items
}

try {
  await loadLeads()
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
.hero,
.panel,
.lead-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #d9e6ed;
  border-radius: 24px;
  padding: 22px;
  box-shadow: 0 16px 40px rgba(36, 76, 96, 0.08);
}
.back-link,
.eyebrow,
.hero-copy,
.hero-stat span,
.lead-head p,
.note-title,
.lead-note p {
  margin: 0;
}
.back-link {
  display: inline-flex;
  margin-bottom: 14px;
  color: #0c607b;
  text-decoration: none;
  font-weight: 700;
}
.eyebrow {
  color: #0c607b;
  font-weight: 700;
}
.hero {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}
.hero-copy {
  margin-top: 8px;
  color: #536c7e;
  line-height: 1.7;
}
.hero-stat {
  min-width: 140px;
  padding: 18px;
  border-radius: 18px;
  background: linear-gradient(180deg, #17394f 0%, #0c607b 100%);
  color: #fff;
  text-align: center;
}
.hero-stat strong {
  display: block;
  font-size: 36px;
}
.lead-grid {
  display: grid;
  gap: 14px;
}
.lead-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}
.lead-head h2 {
  margin: 0;
}
.lead-head p,
.lead-head span,
.lead-note p,
.empty-panel p {
  color: #5c7485;
}
.lead-detail {
  margin: 18px 0 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
.lead-detail div {
  padding: 14px;
  border-radius: 16px;
  border: 1px solid #e4edf3;
  background: #f8fbfd;
}
.lead-detail dt {
  color: #0c607b;
  font-weight: 700;
}
.lead-detail dd {
  margin: 8px 0 0;
  color: #17394f;
  word-break: break-all;
}
.lead-note {
  margin-top: 18px;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid #e4edf3;
  background: #fff;
}
.note-title {
  color: #17394f;
  font-weight: 700;
}
.lead-note p:last-child {
  margin-top: 10px;
  line-height: 1.7;
  white-space: pre-wrap;
}
.empty-panel h2 {
  margin: 0;
}
.empty-panel p {
  margin-top: 8px;
  line-height: 1.7;
}
@media (max-width: 900px) {
  .hero,
  .lead-head,
  .lead-detail {
    grid-template-columns: 1fr;
    display: grid;
  }
}
</style>
