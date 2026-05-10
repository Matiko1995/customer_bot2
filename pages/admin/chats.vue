<template>
  <AdminShell
    title="会话追踪"
    subtitle="按租户查看真实会话、资料命中、检索引用和附件。"
    eyebrow="追踪监控"
    :status-label="tenantId ? '租户范围' : '等待租户'"
    :status-tone="tenantId ? 'normal' : 'warning'"
  >
    <div class="trace-page">
      <section class="panel filter-panel">
        <div>
          <p class="panel-kicker">查询控制台</p>
          <h2>聊天记录</h2>
          <p>输入租户 ID 后查询完整会话。可叠加资料源筛选，或只看命中过资料的消息链路。</p>
        </div>
        <form class="filter-form" @submit.prevent="loadChats">
          <label>
            <span>租户 ID</span>
            <input v-model.trim="tenantId" type="text" placeholder="请输入租户 ID" required />
          </label>
          <label>
            <span>资料源 ID</span>
            <input v-model.trim="sourceId" type="text" placeholder="资料源 ID，可选" />
          </label>
          <label class="check-row">
            <input v-model="matchedOnly" type="checkbox" />
            <span>只看命中过资料</span>
          </label>
          <button type="submit">
            <Search :size="16" />
            查询
          </button>
        </form>
      </section>

      <section class="metric-grid">
        <article class="metric-card">
          <MessageSquareText :size="22" />
          <div>
            <p>会话数</p>
            <strong>{{ filteredItems.length }}</strong>
          </div>
        </article>
        <article class="metric-card">
          <Bot :size="22" />
          <div>
            <p>消息数</p>
            <strong>{{ totalMessages }}</strong>
          </div>
        </article>
        <article class="metric-card">
          <Database :size="22" />
          <div>
            <p>资料命中源</p>
            <strong>{{ sourceStats.length }}</strong>
          </div>
        </article>
      </section>

      <section v-if="sourceStats.length" class="panel">
        <header class="panel-head">
          <div>
            <p class="panel-kicker">知识命中</p>
            <h3>资料命中统计</h3>
          </div>
        </header>
        <div class="stats-list">
          <article v-for="source in sourceStats" :key="source.id" class="stat-card">
            <div class="stat-head">
              <span class="source-pill">{{ formatMatchedSourceLabel(source) }}</span>
              <strong>{{ source.hits }} 次</strong>
            </div>
            <p class="stat-title">{{ source.title }}</p>
            <p v-if="source.category" class="stat-meta">分类：{{ source.category }}</p>
            <p v-if="source.snippet" class="stat-snippet">最近摘录：{{ source.snippet }}</p>
          </article>
        </div>
      </section>

      <section class="session-list">
        <article v-for="item in filteredItems" :key="item.session.id" class="panel session-card">
          <header class="session-head">
            <div>
              <p class="panel-kicker">会话</p>
              <h3>{{ item.session.id }}</h3>
            </div>
            <time>{{ new Date(item.session.lastMessageAt).toLocaleString() }}</time>
          </header>

          <div class="message-list">
            <article v-for="message in item.messages" :key="message.id" class="message" :class="message.role">
              <div class="message-role">
                <User v-if="message.role === 'user'" :size="16" />
                <Bot v-else-if="message.role === 'assistant'" :size="16" />
                <Terminal v-else :size="16" />
                <strong>{{ formatMessageRole(message.role) }}</strong>
              </div>
              <p>{{ message.content }}</p>
              <div v-if="message.role === 'assistant'" class="message-meta-grid">
                <span v-if="message.answerSource" class="meta-chip">回答来源：{{ message.answerSource }}</span>
                <span v-if="message.credentialSource" class="meta-chip">凭据来源：{{ message.credentialSource }}</span>
                <span v-if="message.retrievalConfidence" class="meta-chip">置信度：{{ message.retrievalConfidence }}</span>
              </div>
              <div v-if="message.matchedContentSources?.length" class="matched-sources">
                <p class="matched-title">命中来源</p>
                <ul>
                  <li v-for="source in message.matchedContentSources" :key="source.id">
                    <div class="source-row">
                      <span class="source-pill">{{ formatMatchedSourceLabel(source) }}</span>
                      <span class="source-text">[{{ formatSourceType(source.type) }}] {{ source.title }}<span v-if="source.category"> / {{ source.category }}</span></span>
                    </div>
                    <p v-if="source.snippet" class="source-snippet">命中摘录：{{ source.snippet }}</p>
                    <p v-if="source.answerHints?.length" class="source-hints">回答要点：{{ source.answerHints.join('；') }}</p>
                  </li>
                </ul>
              </div>
              <div v-if="message.citations?.length" class="matched-sources">
                <p class="matched-title">检索引用</p>
                <ul>
                  <li v-for="citation in message.citations" :key="citation.chunkId">
                    <div class="source-row">
                      <span class="source-pill">分数：{{ citation.score }}</span>
                      <span class="source-text">{{ citation.title }}</span>
                    </div>
                    <p class="source-snippet">摘录：{{ citation.snippet }}</p>
                    <p v-if="citation.sourceUri" class="source-hints">来源：{{ citation.sourceUri }}</p>
                  </li>
                </ul>
              </div>
              <div v-if="message.attachments?.length" class="attachments">
                <a
                  v-for="attachment in message.attachments"
                  :key="attachment.id"
                  :href="attachment.dataUrl"
                  target="_blank"
                  rel="noreferrer"
                  class="attachment"
                >
                  <img :src="attachment.dataUrl" :alt="attachment.name" />
                </a>
              </div>
            </article>
          </div>
        </article>
        <p v-if="tenantId && filteredItems.length === 0" class="empty-text">当前筛选条件下没有聊天记录。</p>
      </section>
    </div>
  </AdminShell>
</template>

<script setup lang="ts">
import { Bot, Database, MessageSquareText, Search, Terminal, User } from '../../lib/lucide-icons'
import { aggregateMatchedContentSourceStats, filterChatItemsByMatchedSourceId, filterChatItemsByMatchedSourcesOnly, formatMatchedSourceLabel } from '../../lib/content-ops'
import type { ChatMessageRecord, ChatSessionRecord } from '../../types'

const route = useRoute()
const { request } = useAdminApi()
const tenantId = ref(typeof route.query.tenantId === 'string' ? route.query.tenantId : '')
const sourceId = ref(typeof route.query.sourceId === 'string' ? route.query.sourceId : '')
const matchedOnly = ref(route.query.matchedOnly === 'true')
const items = ref<Array<{ session: ChatSessionRecord; messages: ChatMessageRecord[] }>>([])
const sourceStats = computed(() => aggregateMatchedContentSourceStats(items.value.flatMap((item) => item.messages)))
const filteredItems = computed(() => {
  const matchedFiltered = filterChatItemsByMatchedSourcesOnly(items.value, matchedOnly.value)
  return filterChatItemsByMatchedSourceId(matchedFiltered, sourceId.value)
})
const totalMessages = computed(() => filteredItems.value.reduce((sum, item) => sum + item.messages.length, 0))

function formatMessageRole(role: string) {
  const labels: Record<string, string> = {
    user: '用户',
    assistant: '助手',
    system: '系统'
  }

  return labels[role] || role
}

function formatSourceType(type: string) {
  const labels: Record<string, string> = {
    document: '文档',
    webpage: '网页',
    email: '邮件',
    excel: '表格',
    manual: '手动录入'
  }

  return labels[type] || type
}

async function loadChats() {
  if (!tenantId.value) return
  const response = await request<{ items: Array<{ session: ChatSessionRecord; messages: ChatMessageRecord[] }> }>(
    `/api/admin/chats?tenantId=${encodeURIComponent(tenantId.value)}`
  )
  items.value = response.items
}

if (tenantId.value) {
  await loadChats()
}
</script>

<style scoped>
.trace-page {
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

.filter-panel {
  display: grid;
  grid-template-columns: minmax(260px, 0.7fr) minmax(0, 1.3fr);
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

.filter-panel p:not(.panel-kicker),
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

.check-row {
  min-height: 42px;
  display: flex !important;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border-radius: 11px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.check-row input {
  min-height: 0;
  width: 16px;
  height: 16px;
  padding: 0;
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

.metric-card p {
  margin: 0;
  color: #64748b;
  font-size: 12px;
  font-weight: 900;
}

.metric-card strong {
  display: block;
  color: #0f172a;
  font-size: 30px;
}

.panel-head,
.session-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.stats-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.stat-card {
  padding: 14px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.stat-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.stat-title {
  margin: 10px 0 0;
  color: #0f172a;
  font-weight: 900;
}

.stat-meta,
.stat-snippet {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}

.session-list {
  display: grid;
  gap: 16px;
}

.session-head time {
  color: #64748b;
  font-size: 12px;
  font-weight: 900;
}

.message-list {
  display: grid;
  gap: 12px;
}

.message {
  padding: 14px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.message.assistant {
  background: #f8fbff;
  border-color: #dbeafe;
}

.message-role {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #334155;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

.message p {
  margin: 8px 0 0;
  color: #334155;
  line-height: 1.7;
  white-space: pre-wrap;
}

.message-meta-grid {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.meta-chip,
.source-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 9px;
  border-radius: 999px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 11px;
  font-weight: 900;
}

.matched-sources {
  margin-top: 10px;
  padding: 12px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
}

.matched-title {
  margin: 0 0 8px;
  color: #0f172a;
  font-weight: 900;
}

.matched-sources ul {
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
  list-style: none;
}

.source-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.source-text {
  color: #334155;
  font-size: 13px;
}

.source-snippet,
.source-hints {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}

.source-snippet {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.attachment {
  display: block;
  width: 84px;
  height: 84px;
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid #d7e3ef;
}

.attachment img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

@media (max-width: 1100px) {
  .filter-panel,
  .filter-form,
  .metric-grid {
    grid-template-columns: 1fr;
  }
}
</style>
