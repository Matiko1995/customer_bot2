<template>
  <main class="admin-page">
    <header class="panel">
      <NuxtLink to="/admin/tenants">返回租户</NuxtLink>
      <h1>留资记录</h1>
      <form class="filter" @submit.prevent="loadLeads">
        <input v-model.trim="tenantId" type="text" placeholder="tenantId" required />
        <button type="submit">查询</button>
      </form>
    </header>

    <section class="panel">
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
            <td>{{ item.demandType }}</td>
            <td>{{ item.message }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </main>
</template>

<script setup lang="ts">
import type { LeadRecord } from '../../types'

const { request } = useAdminApi()
const tenantId = ref('')
const items = ref<LeadRecord[]>([])

async function loadLeads() {
  if (!tenantId.value) return
  const response = await request<{ items: LeadRecord[] }>(`/api/admin/leads?tenantId=${encodeURIComponent(tenantId.value)}`)
  items.value = response.items
}
</script>

<style scoped>
.admin-page { padding: 24px; min-height: 100vh; display: grid; gap: 20px; background: #f5f9fc; }
.panel { background: white; border-radius: 18px; padding: 20px; }
.filter { display: flex; gap: 12px; }
input, button { padding: 12px; border-radius: 12px; border: 1px solid #cfd9e2; font: inherit; }
button { background: #0a7ea4; color: white; border: 0; font-weight: 700; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 12px; border-bottom: 1px solid #edf2f7; text-align: left; }
</style>
