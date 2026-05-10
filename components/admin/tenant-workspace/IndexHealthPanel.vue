<template>
  <section class="panel index-health-panel">
    <header>
      <h2>索引健康度</h2>
      <p class="panel-hint">快速查看当前资料源、任务和助手文档输出状态。</p>
    </header>

    <div class="health-grid">
      <article class="health-card">
        <p class="health-label">检索增强</p>
        <code>{{ ragEnabled ? '已启用' : '已关闭' }}</code>
      </article>
      <article class="health-card">
        <p class="health-label">资料源总数</p>
        <code>{{ sources.length }}</code>
      </article>
      <article class="health-card">
        <p class="health-label">活跃资料源</p>
        <code>{{ activeSourceCount }}</code>
      </article>
      <article class="health-card">
        <p class="health-label">成功任务</p>
        <code>{{ successJobCount }}</code>
      </article>
      <article class="health-card">
        <p class="health-label">失败任务</p>
        <code>{{ failedJobCount }}</code>
      </article>
      <article class="health-card">
        <p class="health-label">文档数量</p>
        <code>{{ stats?.documentCount ?? 0 }}</code>
      </article>
      <article class="health-card">
        <p class="health-label">分块数量</p>
        <code>{{ stats?.chunkCount ?? 0 }}</code>
      </article>
    </div>

    <div class="health-actions">
      <button type="button" :disabled="busy || !activeSourceCount" @click="$emit('reindex')">
        {{ busy ? '处理中...' : '重建当前租户索引' }}
      </button>
      <p class="panel-hint">
        最近成功同步：{{ stats?.lastSuccessfulSyncAt ? new Date(stats.lastSuccessfulSyncAt).toLocaleString() : '暂无' }}
      </p>
    </div>

    <p class="panel-hint">助手文档目录：<code>{{ agentDocPath }}</code></p>
  </section>
</template>

<script setup lang="ts">
import type { DataSourceRecord, IngestionJobRecord } from '../../../types'
import type { IndexStatsResponse } from '../../../packages/contracts/src/indexing/job.contract'

const props = defineProps<{
  tenantId: string
  sources: DataSourceRecord[]
  jobs: IngestionJobRecord[]
  stats?: IndexStatsResponse | null
  ragEnabled?: boolean
  busy?: boolean
}>()

defineEmits<{
  reindex: []
}>()

const activeSourceCount = computed(() => props.sources.filter((item) => item.status === 'active').length)
const successJobCount = computed(() => props.jobs.filter((item) => item.status === 'succeeded').length)
const failedJobCount = computed(() => props.jobs.filter((item) => item.status === 'failed').length)
const agentDocPath = computed(() => `.data/agent-docs/${props.tenantId}/latest/`)
</script>

<style scoped>
.index-health-panel { display: grid; gap: 16px; }
.index-health-panel h2 { margin: 0; }
.panel-hint { margin: 6px 0 0; color: #607888; }
.health-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.health-card { display: grid; gap: 8px; padding: 16px; border-radius: 16px; border: 1px solid #d7e3eb; background: #f8fbfd; }
.health-label { margin: 0; color: #607888; }
.health-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
button { padding: 12px; border-radius: 12px; border: 0; background: #0a7ea4; color: white; font-weight: 700; }
@media (max-width: 900px) {
  .health-grid { grid-template-columns: 1fr; }
}
</style>
