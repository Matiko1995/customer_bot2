<template>
  <section class="panel source-library-panel">
    <header class="panel-head">
      <div>
        <h2>资料源管理</h2>
        <p class="panel-hint">创建网页、文件、邮箱资料源，并手动触发同步。</p>
      </div>
      <button type="button" class="ghost-btn" :disabled="busy" @click="$emit('refresh')">刷新</button>
    </header>

    <form class="source-create-grid" @submit.prevent="submitCreate">
      <select v-model="draft.type">
        <option value="file">文件</option>
        <option value="webpage">网页</option>
        <option value="imap">邮箱</option>
      </select>
      <select v-model="draft.syncMode">
        <option value="manual">手动</option>
        <option value="scheduled">周期</option>
      </select>
      <input v-model.trim="draft.scheduleCron" type="text" placeholder="定时表达式（可选）" />

      <template v-if="draft.type === 'webpage'">
        <input v-model.trim="draft.webpageStartUrl" type="text" placeholder="起始链接" />
        <input v-model.trim="draft.webpageAllowedDomains" type="text" placeholder="允许域名，逗号分隔" />
        <input v-model.number="draft.webpageMaxPages" type="number" min="1" placeholder="页面上限" />
      </template>

      <template v-else-if="draft.type === 'imap'">
        <input v-model.trim="draft.imapHost" type="text" placeholder="邮件服务器地址" />
        <input v-model.number="draft.imapPort" type="number" min="1" placeholder="邮件服务器端口" />
        <label class="toggle-line">
          <input v-model="draft.imapSecure" type="checkbox" />
          使用安全连接
        </label>
        <input v-model.trim="draft.imapUsername" type="text" placeholder="邮箱账号" />
        <input v-model="draft.imapPassword" type="password" placeholder="邮箱密码 / 应用专用密码" />
        <input v-model.trim="draft.imapMailbox" type="text" placeholder="邮箱文件夹，例如 收件箱" />
      </template>

      <template v-else>
        <textarea v-model.trim="draft.fileNotes" rows="4" spellcheck="false" placeholder="文件资料源备注（可选）" />
      </template>

      <article class="config-preview">
        <p>配置预览</p>
        <pre>{{ JSON.stringify(previewConfig, null, 2) }}</pre>
      </article>

      <div class="panel-actions">
        <button type="submit" :disabled="busy">{{ busy ? '处理中...' : '创建资料源' }}</button>
      </div>
    </form>

    <div v-if="sources.length" class="source-list">
      <article v-for="item in sources" :key="item.id" class="source-card">
        <div class="source-card-head">
          <div>
            <strong>{{ item.id }}</strong>
            <p>{{ formatSourceType(item.type) }} / {{ formatSyncMode(item.syncMode) }} / {{ formatSourceStatus(item.status) }}</p>
          </div>
          <div class="source-card-actions">
            <button type="button" class="ghost-btn" :disabled="busy || item.status === 'disabled'" @click="$emit('sync', item.id)">同步</button>
            <label v-if="item.type === 'file'" class="upload-btn">
              上传文件
              <input type="file" @change="uploadFile(item.id, $event)" />
            </label>
            <button type="button" class="ghost-btn danger-btn" :disabled="busy || item.status === 'disabled'" @click="$emit('disable', item.id)">停用</button>
          </div>
        </div>
        <ul class="source-summary">
          <li v-for="line in describeSourceConfig(item)" :key="line">{{ line }}</li>
        </ul>
        <pre>{{ JSON.stringify(item.config, null, 2) }}</pre>
        <p class="panel-hint">最近同步：{{ item.lastSyncedAt ? new Date(item.lastSyncedAt).toLocaleString() : '未同步' }}</p>
      </article>
    </div>
    <p v-else class="panel-hint">当前还没有检索资料源。</p>
  </section>
</template>

<script setup lang="ts">
import type { DataSourceRecord } from '../../../types'
import { buildSourceConfigFromDraft, createDefaultSourceDraft, describeSourceConfig } from '../../../lib/source-config'

const emit = defineEmits<{
  refresh: []
  create: [payload: { type: DataSourceRecord['type']; syncMode: DataSourceRecord['syncMode']; scheduleCron?: string; config: Record<string, unknown> }]
  sync: [sourceId: string]
  disable: [sourceId: string]
  upload: [payload: { sourceId: string; file: File }]
}>()

defineProps<{
  sources: DataSourceRecord[]
  busy?: boolean
}>()

const draft = reactive(createDefaultSourceDraft())

const previewConfig = computed(() => buildSourceConfigFromDraft(draft))

function formatSourceType(type: string) {
  const labels: Record<string, string> = {
    file: '文件',
    webpage: '网页',
    imap: '邮箱'
  }

  return labels[type] || type
}

function formatSyncMode(syncMode: string) {
  const labels: Record<string, string> = {
    manual: '手动同步',
    scheduled: '周期同步'
  }

  return labels[syncMode] || syncMode
}

function formatSourceStatus(status: string) {
  const labels: Record<string, string> = {
    active: '运行中',
    disabled: '已停用',
    error: '异常',
    pending: '待同步'
  }

  return labels[status] || status
}

function submitCreate() {
  emit('create', {
    type: draft.type,
    syncMode: draft.syncMode,
    scheduleCron: draft.scheduleCron.trim() || '',
    config: previewConfig.value
  })
}

function uploadFile(sourceId: string, event: Event) {
  const input = event.target as HTMLInputElement | null
  const file = input?.files?.[0]
  if (!file) {
    return
  }

  emit('upload', { sourceId, file })
  input.value = ''
}
</script>

<style scoped>
.source-library-panel { display: grid; gap: 16px; }
.panel-head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
.panel-head h2 { margin: 0; }
.panel-hint { margin: 6px 0 0; color: #607888; }
.source-create-grid { display: grid; gap: 12px; }
.source-create-grid textarea { min-height: 120px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.toggle-line { display: inline-flex; align-items: center; gap: 8px; color: #21425b; font-weight: 600; }
.toggle-line input { margin: 0; width: 16px; height: 16px; }
.config-preview { display: grid; gap: 8px; padding: 14px; border-radius: 14px; border: 1px solid #d7e3eb; background: #f8fbfd; }
.config-preview p { margin: 0; font-weight: 700; color: #21425b; }
.config-preview pre { margin: 0; overflow: auto; padding: 12px; border-radius: 12px; background: #0f1720; color: #e7f0f7; }
.source-list { display: grid; gap: 12px; }
.source-card { display: grid; gap: 10px; padding: 16px; border-radius: 16px; border: 1px solid #d7e3eb; background: #f8fbfd; }
.source-card-head { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
.source-card-head p { margin: 6px 0 0; color: #607888; }
.source-summary { margin: 0; padding-left: 18px; color: #49657c; display: grid; gap: 4px; }
.source-card pre { margin: 0; overflow: auto; padding: 12px; border-radius: 12px; background: #0f1720; color: #e7f0f7; }
.source-card-actions, .panel-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.upload-btn, .ghost-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 12px; border-radius: 12px; border: 1px solid #cfd9e2; background: white; color: #21425b; cursor: pointer; font-weight: 600; }
.upload-btn input { display: none; }
.danger-btn { color: #b42318; }
@media (max-width: 900px) {
  .panel-head, .source-card-head { display: grid; }
}
</style>
