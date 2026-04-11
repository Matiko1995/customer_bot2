<template>
  <section class="panel sync-jobs-panel">
    <header class="panel-head">
      <div>
        <h2>同步任务</h2>
        <p class="panel-hint">查看资料同步任务状态，失败后可重试。</p>
      </div>
      <button type="button" class="ghost-btn" :disabled="busy" @click="$emit('refresh')">刷新</button>
    </header>

    <div v-if="jobs.length" class="job-list">
      <article v-for="job in jobs" :key="job.id" class="job-card">
        <div>
          <strong>{{ job.id }}</strong>
          <p>{{ job.triggerMode }} / {{ job.status }}</p>
        </div>
        <p class="panel-hint">source={{ job.dataSourceId }} / 开始={{ job.startedAt ? new Date(job.startedAt).toLocaleString() : '-' }} / 结束={{ job.finishedAt ? new Date(job.finishedAt).toLocaleString() : '-' }}</p>
        <pre>{{ JSON.stringify(job.stats, null, 2) }}</pre>
        <p v-if="job.errorMessage" class="error-text">{{ job.errorMessage }}</p>
        <div class="job-actions">
          <button type="button" class="ghost-btn" :disabled="busy || job.status !== 'failed'" @click="$emit('retry', job.id)">重试</button>
        </div>
      </article>
    </div>
    <p v-else class="panel-hint">当前还没有同步任务记录。</p>
  </section>
</template>

<script setup lang="ts">
import type { IngestionJobRecord } from '../../../types'

defineProps<{
  jobs: IngestionJobRecord[]
  busy?: boolean
}>()

defineEmits<{
  refresh: []
  retry: [jobId: string]
}>()
</script>

<style scoped>
.sync-jobs-panel { display: grid; gap: 16px; }
.panel-head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
.panel-head h2 { margin: 0; }
.panel-hint { margin: 6px 0 0; color: #607888; }
.job-list { display: grid; gap: 12px; }
.job-card { display: grid; gap: 10px; padding: 16px; border-radius: 16px; border: 1px solid #d7e3eb; background: #f8fbfd; }
.job-card p { margin: 0; }
.job-card pre { margin: 0; overflow: auto; padding: 12px; border-radius: 12px; background: #0f1720; color: #e7f0f7; }
.job-actions { display: flex; gap: 10px; }
.ghost-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 12px; border-radius: 12px; border: 1px solid #cfd9e2; background: white; color: #21425b; cursor: pointer; font-weight: 600; }
.error-text { color: #b42318; }
@media (max-width: 900px) {
  .panel-head { display: grid; }
}
</style>
