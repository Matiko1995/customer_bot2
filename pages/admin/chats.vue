<template>
  <main class="admin-page">
    <header class="panel">
      <NuxtLink to="/admin/tenants">返回租户</NuxtLink>
      <h1>聊天记录</h1>
      <form class="filter" @submit.prevent="loadChats">
        <input v-model.trim="tenantId" type="text" placeholder="tenantId" required />
        <input v-model.trim="sourceId" type="text" placeholder="sourceId，可选" />
        <button type="submit">查询</button>
        <label class="toggle-filter">
          <input v-model="matchedOnly" type="checkbox" />
          只看命中过资料
        </label>
      </form>
    </header>

    <section v-if="sourceStats.length" class="panel">
      <h2>资料命中统计</h2>
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

    <section v-for="item in filteredItems" :key="item.session.id" class="panel">
      <h2>{{ item.session.id }}</h2>
      <p>最后消息时间：{{ new Date(item.session.lastMessageAt).toLocaleString() }}</p>
      <article v-for="message in item.messages" :key="message.id" class="message">
        <strong>{{ message.role }}</strong>
        <p>{{ message.content }}</p>
        <div v-if="message.role === 'assistant'" class="message-meta-grid">
          <span v-if="message.answerSource" class="meta-chip">answer={{ message.answerSource }}</span>
          <span v-if="message.credentialSource" class="meta-chip">credential={{ message.credentialSource }}</span>
          <span v-if="message.retrievalConfidence" class="meta-chip">confidence={{ message.retrievalConfidence }}</span>
        </div>
        <div v-if="message.matchedContentSources?.length" class="matched-sources">
          <p class="matched-title">命中来源</p>
          <ul>
            <li v-for="source in message.matchedContentSources" :key="source.id">
              <div class="source-row">
                <span class="source-pill">{{ formatMatchedSourceLabel(source) }}</span>
                <span class="source-text">[{{ source.type }}] {{ source.title }}<span v-if="source.category"> / {{ source.category }}</span></span>
              </div>
              <p v-if="source.snippet" class="source-snippet">命中摘录：{{ source.snippet }}</p>
              <p v-if="source.answerHints?.length" class="source-hints">回答要点：{{ source.answerHints.join('；') }}</p>
            </li>
          </ul>
        </div>
        <div v-if="message.citations?.length" class="matched-sources">
          <p class="matched-title">RAG 引用</p>
          <ul>
            <li v-for="citation in message.citations" :key="citation.chunkId">
              <div class="source-row">
                <span class="source-pill">score={{ citation.score }}</span>
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
    </section>
  </main>
</template>

<script setup lang="ts">
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

async function loadChats() {
  if (!tenantId.value) return
  const response = await request<{ items: Array<{ session: ChatSessionRecord; messages: ChatMessageRecord[] }> }>(
    `/api/admin/chats?tenantId=${encodeURIComponent(tenantId.value)}`
  )
  items.value = response.items
}
</script>

<style scoped>
.admin-page { padding: 24px; min-height: 100vh; display: grid; gap: 20px; background: #f5f9fc; }
.panel { background: white; border-radius: 18px; padding: 20px; }
.stats-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
.stat-card { padding: 14px; border-radius: 14px; background: #f8fbfd; border: 1px solid #e5edf3; }
.stat-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.stat-title { margin: 10px 0 0; font-weight: 700; color: #21425b; }
.stat-meta, .stat-snippet { margin: 6px 0 0; color: #5b7387; font-size: 13px; line-height: 1.6; }
.filter { display: flex; gap: 12px; }
input, button { padding: 12px; border-radius: 12px; border: 1px solid #cfd9e2; font: inherit; }
button { background: #0a7ea4; color: white; border: 0; font-weight: 700; }
.toggle-filter { display: inline-flex; align-items: center; gap: 8px; color: #21425b; font-weight: 600; }
.toggle-filter input { margin: 0; padding: 0; width: 16px; height: 16px; }
.message { padding: 12px 0; border-top: 1px solid #edf2f7; }
.message p { margin: 6px 0 0; white-space: pre-wrap; }
.message-meta-grid { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
.meta-chip { display: inline-flex; align-items: center; justify-content: center; padding: 4px 10px; border-radius: 999px; background: rgba(20, 56, 74, 0.08); color: #173a4f; font-size: 12px; font-weight: 700; }
.matched-sources { margin-top: 10px; padding: 10px 12px; border-radius: 12px; background: #f8fbfd; border: 1px solid #e5edf3; }
.matched-title { margin: 0 0 6px; font-weight: 700; color: #21425b; }
.matched-sources ul { margin: 0; padding-left: 0; color: #34536b; list-style: none; display: grid; gap: 8px; }
.source-row { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.source-pill { display: inline-flex; align-items: center; justify-content: center; margin-right: 8px; padding: 4px 10px; border-radius: 999px; background: rgba(10, 126, 164, 0.12); color: #0a6181; font-size: 12px; font-weight: 700; }
.source-text { color: #34536b; }
.source-snippet, .source-hints { margin: 6px 0 0; padding-left: 2px; color: #49657c; font-size: 13px; line-height: 1.6; }
.source-snippet { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
.attachments { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.attachment { display: block; width: 84px; height: 84px; overflow: hidden; border-radius: 10px; border: 1px solid #d7e3ef; }
.attachment img { width: 100%; height: 100%; object-fit: cover; display: block; }
@media (max-width: 900px) { .filter { flex-wrap: wrap; } }
</style>
